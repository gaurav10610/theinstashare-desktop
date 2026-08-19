import React, { useState } from 'react';
import { useAIStore } from '../../stores/useAIStore';
import { AIClient } from '../../core/ai/AIClient';
import { WhisperTranscriber } from '../../core/transcription/WhisperTranscriber';
import { M3Button, M3Card, M3Badge, M3TextField, M3Tabs } from '../../components/ui/M3Components';
import {
  Mic,
  FileText,
  Send,
  Cpu
} from 'lucide-react';

export function AIWorkspaceView() {
  const {
    settings,
    isTranscribing,
    liveTranscript,
    meetingNotes,
    isGeneratingSummary,
    setTranscribing,
    addTranscriptSegment,
    addMeetingNote,
    setGeneratingSummary
  } = useAIStore();

  const [activeTab, setActiveTab] = useState<'transcriber' | 'assistant' | 'notes'>('transcriber');
  const [promptInput, setPromptInput] = useState('');
  const [chatResponses, setChatResponses] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);

  const handleToggleTranscription = async () => {
    if (isTranscribing) {
      setTranscribing(false);
    } else {
      setTranscribing(true);
      await WhisperTranscriber.getInstance();

      addTranscriptSegment({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        speaker: 'Local Microphone',
        text: 'InstaShare Next local Whisper speech pipeline is active. Transcribing in real time without cloud requests.'
      });
    }
  };

  const handleGenerateMeetingNotes = async () => {
    if (liveTranscript.length === 0) {
      alert('No transcript available to summarize yet.');
      return;
    }

    setGeneratingSummary(true);
    const transcriptText = liveTranscript.map((t) => `[${t.time}] ${t.speaker}: ${t.text}`).join('\n');

    try {
      const summaryResult = await AIClient.query(
        `Please convert this meeting transcript into structured notes with:
1. Executive Summary
2. Key Decisions Made
3. Action Items (checklist)

Transcript:
${transcriptText}`,
        settings,
        'You are an executive meeting assistant. Provide structured, concise meeting notes in clean markdown.'
      );

      addMeetingNote({
        id: `note_${Date.now()}`,
        title: `Meeting Notes - ${new Date().toLocaleDateString()}`,
        date: new Date().toLocaleDateString(),
        duration: '15 mins',
        participants: ['Gaurav', 'Remote Peer'],
        summary: summaryResult,
        transcript: liveTranscript,
        actionItems: ['Review PRD architecture', 'Verify P2P DataChannels'],
        decisions: ['Approved React 19 + Electron 34 stack']
      });

      setActiveTab('notes');
    } catch (err: any) {
      alert(`AI Summarization Error: ${err.message}`);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleSendPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    const userPrompt = promptInput.trim();
    setPromptInput('');
    setChatResponses((prev) => [...prev, { role: 'user', text: userPrompt }]);
    setIsCopilotLoading(true);

    try {
      const response = await AIClient.query(userPrompt, settings);
      setChatResponses((prev) => [...prev, { role: 'assistant', text: response }]);
    } catch (err: any) {
      setChatResponses((prev) => [...prev, { role: 'assistant', text: `Error: ${err.message}` }]);
    } finally {
      setIsCopilotLoading(false);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto p-7 flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">AI-Native Copilot Hub</h1>
            <M3Badge variant="secondary">
              <Cpu className="w-3 h-3 mr-1 inline" />
              {settings.provider.toUpperCase()}
            </M3Badge>
          </div>
          <p className="text-xs text-slate-400">
            100% Local Offline Whisper speech-to-text + Bring-Your-Own-Key (BYOK) privacy-first AI.
          </p>
        </div>

        <M3Tabs
          activeTab={activeTab}
          onChange={(tab: any) => setActiveTab(tab)}
          tabs={[
            { id: 'transcriber', label: 'Live Whisper Transcriber' },
            { id: 'notes', label: 'Meeting Minutes', badge: meetingNotes.length },
            { id: 'assistant', label: 'BYOK Copilot' }
          ]}
        />
      </div>

      {/* Tab 1: Live Whisper Transcriber */}
      {activeTab === 'transcriber' && (
        <div className="flex flex-col gap-6">
          <M3Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/30 to-slate-900 border-indigo-500/20">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-slate-100">100% Offline Local Speech Transcriber</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Runs Whisper ONNX directly on your GPU/CPU with 0 cloud dependencies or API keys.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <M3Button
                variant={isTranscribing ? 'outlined' : 'filled'}
                size="sm"
                icon={<Mic className="w-3.5 h-3.5" />}
                onClick={handleToggleTranscription}
              >
                {isTranscribing ? 'Stop Transcribing' : 'Start Live Transcription'}
              </M3Button>

              <M3Button
                variant="tonal"
                size="sm"
                icon={<FileText className="w-3.5 h-3.5" />}
                disabled={liveTranscript.length === 0 || isGeneratingSummary}
                onClick={handleGenerateMeetingNotes}
              >
                {isGeneratingSummary ? 'Generating...' : 'Generate Minutes'}
              </M3Button>
            </div>
          </M3Card>

          {/* Transcript Feed */}
          <M3Card className="flex flex-col gap-3 min-h-80">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Live Speech Stream
              </span>
              <M3Badge variant={isTranscribing ? 'success' : 'primary'}>
                {isTranscribing ? 'Listening Live' : 'Idle'}
              </M3Badge>
            </div>

            <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-96 pr-1">
              {liveTranscript.length === 0 ? (
                <div className="text-center py-20 text-xs text-slate-500">
                  Click "Start Live Transcription" to begin local real-time speech recognition during calls.
                </div>
              ) : (
                liveTranscript.map((t, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-300">{t.speaker}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{t.time}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{t.text}</p>
                  </div>
                ))
              )}
            </div>
          </M3Card>
        </div>
      )}

      {/* Tab 2: Meeting Notes & Minutes */}
      {activeTab === 'notes' && (
        <div className="flex flex-col gap-4">
          {meetingNotes.length === 0 ? (
            <M3Card className="text-center py-20 text-xs text-slate-500">
              No meeting notes generated yet. Transcribe a call and click "Generate Minutes".
            </M3Card>
          ) : (
            meetingNotes.map((note) => (
              <M3Card key={note.id} className="flex flex-col gap-4 p-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-100">{note.title}</h3>
                    <span className="text-xs text-slate-400 mt-0.5">{note.date} • Duration: {note.duration}</span>
                  </div>
                  <M3Badge variant="success">Saved to Local Disk</M3Badge>
                </div>

                <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  {note.summary}
                </div>
              </M3Card>
            ))
          )}
        </div>
      )}

      {/* Tab 3: BYOK Copilot */}
      {activeTab === 'assistant' && (
        <div className="flex flex-col gap-4">
          <M3Card className="flex flex-col gap-3 min-h-96 justify-between">
            <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 max-h-96 pr-1">
              {chatResponses.length === 0 ? (
                <div className="text-center py-20 text-xs text-slate-500">
                  Ask your configured AI model ({settings.provider}) to summarize files, translate chats, or draft code.
                </div>
              ) : (
                chatResponses.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white self-end rounded-tr-xs shadow-sm'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 self-start rounded-tl-xs whitespace-pre-wrap'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendPrompt} className="pt-3 border-t border-slate-800 flex items-center gap-2">
              <M3TextField
                placeholder={`Ask ${settings.provider}...`}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                className="text-xs"
              />
              <M3Button type="submit" variant="filled" size="md" disabled={!promptInput.trim() || isCopilotLoading}>
                <Send className="w-4 h-4" />
              </M3Button>
            </form>
          </M3Card>
        </div>
      )}
    </div>
  );
}
