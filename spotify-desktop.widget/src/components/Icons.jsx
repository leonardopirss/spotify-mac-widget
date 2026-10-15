const icon = (children) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    {children}
  </svg>
);

export const PlayIcon = () => icon(<path d="M8 5.2v13.6a1 1 0 0 0 1.54.84l10-6.8a1 1 0 0 0 0-1.68l-10-6.8A1 1 0 0 0 8 5.2Z" />);
export const PauseIcon = () => icon(<path d="M7 5.5A1.5 1.5 0 0 1 8.5 4h1A1.5 1.5 0 0 1 11 5.5v13A1.5 1.5 0 0 1 9.5 20h-1A1.5 1.5 0 0 1 7 18.5v-13Zm6 0A1.5 1.5 0 0 1 14.5 4h1A1.5 1.5 0 0 1 17 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5v-13Z" />);
export const PreviousIcon = () => icon(<path d="M6 5a1 1 0 0 1 1 1v5.12l9.45-6.08A1 1 0 0 1 18 5.88v12.24a1 1 0 0 1-1.55.84L7 12.88V18a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1Z" />);
export const NextIcon = () => icon(<path d="M18 5a1 1 0 0 0-1 1v5.12L7.55 5.04A1 1 0 0 0 6 5.88v12.24a1 1 0 0 0 1.55.84L17 12.88V18a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1Z" />);
export const MusicIcon = () => icon(<path d="M19 3.2v11.55a3.75 3.75 0 1 1-2-3.31V7.06l-7 1.56v8.13a3.75 3.75 0 1 1-2-3.31V7.82a1 1 0 0 1 .78-.98l9-2A1 1 0 0 1 19 5.82V3.2Z" />);

