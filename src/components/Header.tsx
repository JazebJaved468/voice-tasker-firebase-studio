import { MicVocal } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-primary shadow-md">
      <div className="container mx-auto px-4 py-4 md:px-6">
        <div className="flex items-center space-x-2">
          <MicVocal className="h-8 w-8 text-primary-foreground" />
          <h1 className="text-3xl font-bold text-primary-foreground font-headline">
            VoiceTasker
          </h1>
        </div>
      </div>
    </header>
  );
}
