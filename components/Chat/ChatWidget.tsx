'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Platform, Service, AggregatedRoute } from '@/lib/types';
import {
  findPlatformsAsync,
  findRoutes,
  FoundRoute,
  haversineKm,
  geocodeCity,
} from '@/lib/routeFinder';
import { getOperatorContact } from '@/lib/operatorContacts';
import { useSearchStore } from '@/store/useSearchStore';

const IAKLEFER_API = 'https://www.iaklefer.fr/api/chat';

// IA k LEFER brand colors
const IAK = {
  orange: '#D2691E',
  orangeLight: '#F48D27',
  brown: '#995614',
  brownDark: '#745000',
  cream: '#fff3e9',
  navy: '#003366',
  gradient: 'linear-gradient(135deg, #D2691E, #F48D27)',
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isRouteResult?: boolean;
}

interface ChatWidgetProps {
  platforms?: Platform[];
  services?: Service[];
  routes?: AggregatedRoute[];
}

const SUGGESTIONS = [
  'Transporter des marchandises de Marseille à Lyon',
  'Quels opérateurs desservent Paris ?',
  'Quels sont les avantages du transport combiné ?',
];

// Detect if a message is a transport/route query and extract origin/destination
function parseTransportQuery(text: string): { from: string; to: string } | null {
  const normalized = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  // Patterns: "de X à Y", "de X vers Y", "de X a Y", "X → Y", "X - Y", "depuis X jusqu'à Y", "entre X et Y"
  const patterns = [
    /(?:transporter|envoyer|expedier|acheminer|livrer|faire\s+partir).*?(?:de|depuis)\s+(.+?)\s+(?:a|à|vers|jusqu'a|jusqu'à|direction)\s+(.+?)(?:\s*[?.!]|$)/,
    /(?:de|depuis)\s+(.+?)\s+(?:a|à|vers|jusqu'a|jusqu'à|direction)\s+(.+?)(?:\s*[?.!]|$)/,
    /(?:entre)\s+(.+?)\s+(?:et)\s+(.+?)(?:\s*[?.!]|$)/,
    /(?:^|\s)([a-zà-ÿ\s-]+?)\s*(?:→|->|=>)\s*([a-zà-ÿ\s-]+)/,
    /(?:trajet|liaison|itineraire|route|solution).*?(.+?)\s+(?:a|à|vers)\s+(.+?)(?:\s*[?.!]|$)/,
    /(?:comment).*?(?:de|depuis)\s+(.+?)\s+(?:a|à|vers)\s+(.+?)(?:\s*[?.!]|$)/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) {
      const from = cleanCityName(match[1]);
      const to = cleanCityName(match[2]);
      if (from.length >= 2 && to.length >= 2) {
        return { from, to };
      }
    }
  }

  return null;
}

function cleanCityName(raw: string): string {
  return raw
    .replace(/\b(mes|les|des|nos|vos|leurs|du|de la|poires|marchandises|produits|colis|palettes|conteneurs|containers|camions|lots)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Detect proximity queries: "plateforme proche de X", "à partir de X", "depuis X", etc.
function parseProximityQuery(text: string): string | null {
  const normalized = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  const patterns = [
    /(?:plateforme|terminal|gare|site)s?\s+(?:la |le )?(?:plus\s+)?proch(?:e|es)\s+(?:de|d'|du|a|à)\s+(.+?)(?:\s*[?.!]|$)/,
    /(?:a\s+partir|au\s+depart|depuis)\s+(?:de\s+)?(.+?)(?:\s+(?:quelle|quel|ou|comment|vers|la|le)).*?(?:plateforme|terminal|gare|site)/i,
    /(?:a\s+partir|au\s+depart|depuis)\s+(?:de\s+)?(.+?)(?:\s*[?.!]|$)/,
    /(?:transport|transporter|expedier|envoyer).*?(?:a\s+partir|au\s+depart|depuis)\s+(?:de\s+)?(.+?)(?:\s*[?.!]|$)/,
    /(?:proch(?:e|es)\s+(?:de|d'|du))\s+(.+?)(?:\s*[?.!]|$)/,
    /(?:autour|pres|a\s+cote)\s+(?:de|d'|du)\s+([a-zA-ZÀ-ÿ\s-]+?)(?:\s*[,?.!]|\s+(?:ou|quel|comment|le|la|les|il))/,
    /(?:desser(?:t|vent|vi))\s+(.+?)(?:\s*[?.!]|$)/,
    /(?:quelle|quel)s?\s+(?:plateforme|terminal|site)s?.*?(?:pour|a|à|pres|proche|depuis|de)\s+(.+?)(?:\s*[?.!]|$)/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) {
      const city = cleanCityName(match[1]);
      if (city.length >= 2) return city;
    }
  }

  return null;
}

// Find nearest platforms to a city
async function findNearestPlatforms(
  city: string,
  platforms: Platform[],
  maxResults = 5
): Promise<{ platform: Platform; distance: number }[]> {
  // Try geocoding the city
  const coords = await geocodeCity(city);
  if (!coords) return [];

  return platforms
    .map((p) => ({
      platform: p,
      distance: Math.round(haversineKm(coords.lat, coords.lon, p.lat, p.lon)),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxResults);
}

// Format proximity results
function formatProximityResults(
  nearest: { platform: Platform; distance: number }[],
  city: string
): string {
  if (nearest.length === 0) {
    return `Impossible de localiser **${city}**. Vérifiez l'orthographe ou essayez une ville voisine.`;
  }

  let msg = `Plateformes les plus proches de **${city}** :\n\n`;

  for (let i = 0; i < nearest.length; i++) {
    const { platform: p, distance } = nearest[i];
    msg += `**${i + 1}. ${p.site}**\n`;
    msg += `   ${p.ville} (${p.departement}) — ${distance} km`;
    if (p.exploitant) msg += ` — ${p.exploitant}`;
    msg += '\n';

    const contact = getOperatorContact(p.exploitant);
    if (contact?.phone || contact?.email) {
      const parts: string[] = [];
      if (contact.phone) parts.push(contact.phone);
      if (contact.email) parts.push(contact.email);
      msg += `   Contact : ${parts.join(' | ')}\n`;
    }
    msg += '\n';
  }

  msg += `Utilisez **"Trouver un transport"** pour chercher un itinéraire depuis l'une de ces plateformes.`;
  return msg;
}

// Format route results as a markdown chat message
function formatRouteResults(routes: FoundRoute[], from: string, to: string): string {
  if (routes.length === 0) {
    return `**Aucune solution trouvée** pour le trajet **${from}** → **${to}**.\n\nEssayez avec des villes voisines ou utilisez le bouton **"Trouver un transport"** pour une recherche plus large.`;
  }

  const maxShow = Math.min(routes.length, 3);
  let msg = `**${routes.length} solution${routes.length > 1 ? 's' : ''}** trouvée${routes.length > 1 ? 's' : ''} pour **${from}** → **${to}** :\n\n`;

  for (let i = 0; i < maxShow; i++) {
    const r = routes[i];
    const badge = r.type === 'direct' ? 'Direct' : 'Correspondance';
    const path = r.legs.map((l) => l.from).concat(r.legs[r.legs.length - 1].to).join(' → ');

    msg += `**${i + 1}. ${badge}** — ${r.operators.join(', ')}\n`;
    msg += `${path}\n`;
    msg += `${r.totalFreq} train${r.totalFreq > 1 ? 's' : ''}/semaine\n`;

    // Add operator contact info
    for (const op of r.operators) {
      const contact = getOperatorContact(op);
      if (contact) {
        const parts: string[] = [];
        if (contact.phone) parts.push(contact.phone);
        if (contact.email) parts.push(contact.email);
        if (parts.length > 0) {
          msg += `Contact ${op} : ${parts.join(' | ')}\n`;
        }
      }
    }
    msg += '\n';
  }

  if (routes.length > maxShow) {
    msg += `*+ ${routes.length - maxShow} autre${routes.length - maxShow > 1 ? 's' : ''} solution${routes.length - maxShow > 1 ? 's' : ''}...*\n\n`;
  }

  msg += `Cliquez sur **"Voir dans le planificateur"** ci-dessous pour afficher les détails complets et visualiser les itinéraires sur la carte.`;

  return msg;
}

export default function ChatWidget({ platforms, services }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [pulseVisible, setPulseVisible] = useState(true);
  // Store last route query for "open in planner" button
  const [lastRouteQuery, setLastRouteQuery] = useState<{ from: string; to: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { setSearchOpen, setDepartureQuery, setArrivalQuery } = useSearchStore();

  useEffect(() => {
    if (open) setPulseVisible(false);
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const handleClearChat = () => {
    if (streaming && abortRef.current) {
      abortRef.current.abort();
      setStreaming(false);
    }
    setMessages([]);
    setInput('');
    setLastRouteQuery(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleOpenPlanner = () => {
    if (lastRouteQuery) {
      setDepartureQuery(lastRouteQuery.from);
      setArrivalQuery(lastRouteQuery.to);
      setSearchOpen(true);
      setOpen(false);
    }
  };

  // Search routes locally using cartography data
  const searchLocalRoutes = useCallback(async (from: string, to: string): Promise<FoundRoute[]> => {
    if (!platforms || !services) return [];

    const depSuggestions = await findPlatformsAsync(from, platforms, 5, services);
    const arrSuggestions = await findPlatformsAsync(to, platforms, 5, services);

    const depPlatforms = depSuggestions.map((s) => s.platform);
    const arrPlatforms = arrSuggestions.map((s) => s.platform);

    if (depPlatforms.length === 0 || arrPlatforms.length === 0) return [];

    return findRoutes(depPlatforms, arrPlatforms, platforms, services, new Set());
  }, [platforms, services]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');

    // Check if it's a transport query
    const routeQuery = parseTransportQuery(text);

    if (routeQuery && platforms && services) {
      // Handle locally: search in our data
      setStreaming(true);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Recherche dans le réseau de transport combiné...' }]);

      try {
        const routes = await searchLocalRoutes(routeQuery.from, routeQuery.to);
        const formattedFrom = routeQuery.from.charAt(0).toUpperCase() + routeQuery.from.slice(1);
        const formattedTo = routeQuery.to.charAt(0).toUpperCase() + routeQuery.to.slice(1);
        const response = formatRouteResults(routes, formattedFrom, formattedTo);

        setLastRouteQuery({ from: formattedFrom, to: formattedTo });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: response, isRouteResult: true };
          return updated;
        });
      } catch {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: 'Erreur lors de la recherche. Utilisez le bouton **"Trouver un transport"** pour chercher manuellement.',
          };
          return updated;
        });
      } finally {
        setStreaming(false);
      }
      return;
    }

    // Check if it's a proximity query ("plateforme proche de X", "à partir de X")
    const proximityCity = parseProximityQuery(text);

    if (proximityCity && platforms) {
      setStreaming(true);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Recherche des plateformes proches...' }]);

      try {
        const nearest = await findNearestPlatforms(proximityCity, platforms, 5);
        const formattedCity = proximityCity.charAt(0).toUpperCase() + proximityCity.slice(1);
        const response = formatProximityResults(nearest, formattedCity);

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: response };
          return updated;
        });
      } catch {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: 'Erreur lors de la recherche. Utilisez la carte pour localiser les plateformes.',
          };
          return updated;
        });
      } finally {
        setStreaming(false);
      }
      return;
    }

    // General question → send to IA k LEFER API
    setStreaming(true);
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch(IAKLEFER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Tu es un assistant intégré dans une carte interactive du transport combiné rail-route (GNTC/OTC). Réponds de manière courte et concise (5 phrases maximum). Va droit au but. Utilise des listes à puces si nécessaire. Ne fais pas de longues introductions. Si l\'utilisateur demande comment transporter quelque chose d\'un point A à un point B, dis-lui d\'utiliser le bouton "Trouver un transport" de la carte ou de te reposer la question en précisant les villes de départ et d\'arrivée.',
            },
            ...newMessages.map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`Erreur ${res.status}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            const chunk = parsed.content || parsed.choices?.[0]?.delta?.content || '';
            if (chunk) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === 'assistant') {
                  updated[updated.length - 1] = { ...last, content: last.content + chunk };
                }
                return updated;
              });
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.role === 'assistant' && !last.content) {
          updated[updated.length - 1] = {
            ...last,
            content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
          };
        }
        return updated;
      });
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [messages, streaming, platforms, services, searchLocalRoutes]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleClose = () => {
    if (streaming && abortRef.current) abortRef.current.abort();
    setOpen(false);
  };

  return (
    <>
      {/* Chat Panel */}
      {open && (
        <div
          className="fixed bottom-20 right-4 z-[1100] w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-120px)] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in"
          style={{ border: `1px solid ${IAK.orange}30` }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 text-white flex-shrink-0"
            style={{ background: IAK.gradient }}
          >
            <img
              src="/logos/iaklefer-logo.svg"
              alt="IA k LEFER"
              className="h-7 flex-shrink-0 brightness-0 invert"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] opacity-80 leading-tight">Assistant transport ferroviaire</div>
            </div>
            {/* Clear chat button */}
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0"
                title="Nouvelle conversation"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M1 1L13 13" />
                  <path d="M13 1v3h-3" />
                  <path d="M1 13v-3h3" />
                </svg>
              </button>
            )}
            {/* Close button */}
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 3L11 11M3 11L11 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ background: IAK.cream }}>
            {messages.length === 0 && (
              <div className="text-center py-6 px-2">
                <img
                  src="/logos/iaklefer-logo.svg"
                  alt="IA k LEFER"
                  className="h-10 mx-auto mb-3"
                />
                <p className="text-sm font-medium mb-1" style={{ color: IAK.brown }}>
                  Posez votre question
                </p>
                <p className="text-[11px] leading-relaxed mb-4" style={{ color: IAK.brownDark }}>
                  Demandez un trajet, un opérateur, ou des infos sur le transport combiné.
                </p>
                <div className="space-y-1.5">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s)}
                      className="w-full text-left text-[11px] px-3 py-2 rounded-lg bg-white border transition-colors leading-snug"
                      style={{ borderColor: `${IAK.orange}30`, color: IAK.navy }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = IAK.orange;
                        e.currentTarget.style.backgroundColor = `${IAK.orange}08`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = `${IAK.orange}30`;
                        e.currentTarget.style.backgroundColor = 'white';
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i}>
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'text-white rounded-br-md'
                        : 'bg-white text-[#2b2b2b] rounded-bl-md shadow-sm'
                    }`}
                    style={
                      msg.role === 'user'
                        ? { background: IAK.gradient }
                        : { border: `1px solid ${IAK.orange}20` }
                    }
                  >
                    {msg.role === 'assistant' ? (
                      <div className="chat-markdown prose prose-sm max-w-none">
                        <ReactMarkdown>{msg.content || '...'}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                    {msg.role === 'assistant' && streaming && i === messages.length - 1 && (
                      <span
                        className="inline-block w-1.5 h-3.5 ml-0.5 animate-pulse rounded-sm"
                        style={{ backgroundColor: IAK.orange }}
                      />
                    )}
                  </div>
                </div>
                {/* "Open in planner" button after route results */}
                {msg.isRouteResult && !streaming && (
                  <div className="flex justify-start mt-2 ml-1">
                    <button
                      onClick={handleOpenPlanner}
                      className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg text-white transition-all hover:shadow-md hover:scale-[1.02]"
                      style={{ background: 'var(--gntc-gradient, linear-gradient(to bottom right, #587bbd, #7dc243))' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Voir dans le planificateur
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 border-t bg-white p-3" style={{ borderColor: `${IAK.orange}20` }}>
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ex: transporter de Lyon à Marseille..."
                disabled={streaming}
                className="flex-1 text-xs rounded-xl px-3.5 py-2.5 placeholder:text-gray-400 focus:outline-none transition-colors disabled:opacity-60"
                style={{
                  backgroundColor: IAK.cream,
                  border: `1px solid ${IAK.orange}30`,
                  color: IAK.navy,
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = IAK.orange; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = `${IAK.orange}30`; }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || streaming}
                className="flex-shrink-0 w-9 h-9 rounded-xl text-white flex items-center justify-center transition-all hover:shadow-md disabled:opacity-40 disabled:hover:shadow-none"
                style={{ background: IAK.gradient }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8L14 8M14 8L9 3M14 8L9 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-center gap-1 mt-2">
              <span className="text-[9px] text-gray-400">Propulsé par</span>
              <a
                href="https://www.iaklefer.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] font-semibold hover:opacity-80 transition-opacity"
                style={{ color: IAK.orange }}
              >
                IA k LEFER
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bubble */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-[1100] w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 hover:shadow-xl"
        style={{ background: open ? IAK.navy : IAK.gradient }}
        title="Assistant IA k LEFER"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M6 6L16 16M6 16L16 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M8 9h8M8 13h4" />
            </svg>
            {pulseVisible && (
              <span
                className="absolute inset-0 rounded-full animate-ping opacity-40"
                style={{ background: IAK.gradient }}
              />
            )}
          </>
        )}
      </button>
    </>
  );
}
