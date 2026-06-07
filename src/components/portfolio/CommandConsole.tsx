'use client';

import { FormEvent, KeyboardEvent, useState } from 'react';

type CommandConsoleProps = {
  consoleOutput: string;
  mode: string;
  modeLabel: string;
  availability: string;
  availabilityLabel: string;
  onSubmitCommand: (command: string) => string[];
};

export function CommandConsole({
  consoleOutput,
  mode,
  modeLabel,
  availability,
  availabilityLabel,
  onSubmitCommand,
}: CommandConsoleProps) {
  const [command, setCommand] = useState('');
  const [lines, setLines] = useState<string[]>([]);

  const submitCommand = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedCommand = command.trim();

    if (!normalizedCommand) {
      return;
    }

    const output = onSubmitCommand(normalizedCommand);
    setLines([`$ ${normalizedCommand}`, ...output]);
    setCommand('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setCommand('');
      setLines([]);
    }
  };

  return (
    <div className="w-full py-1.5">
      {lines.length > 0 && (
        <div className="mb-1.5 max-h-24 overflow-y-auto border border-[#00ff88]/20 bg-[#050812]/95 px-3 py-2 text-[11px] leading-relaxed shadow-[0_0_14px_rgba(0,255,136,0.08)]">
          {lines.map((line, index) => (
            <div key={`${line}-${index}`} className={index === 0 ? 'text-cyan-300' : 'text-gray-400'}>
              {line}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <form onSubmit={submitCommand} className="flex min-w-0 flex-1 items-center gap-2">
          <span className="text-gray-500">stdout:</span>
          <span className="hidden min-w-0 truncate text-cyan-300 md:inline">{consoleOutput}</span>
          <span className="text-[#00ff88]">$</span>
          <input
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            onKeyDown={handleKeyDown}
            className="min-w-0 flex-1 bg-transparent text-cyan-100 placeholder:text-gray-600 focus:outline-none"
            placeholder='Type "help" or a command...'
            aria-label="Command console"
            autoComplete="off"
            spellCheck={false}
          />
        </form>

        <div className="hidden shrink-0 items-center gap-4 sm:flex">
          <span className="text-gray-500">{modeLabel}</span>
          <span className="text-[#00ff88]">{mode}</span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-500">{availabilityLabel}</span>
          <span className="text-cyan-400">{availability}</span>
        </div>
      </div>
    </div>
  );
}
