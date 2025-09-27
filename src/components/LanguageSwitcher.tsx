import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === 'es' ? 'en' : language === 'en' ? 'pt' : 'es')}
      className="flex items-center gap-2"
    >
      <Globe className="h-4 w-4" />
      <span className="text-sm font-medium">{language.toUpperCase()}</span>
    </Button>
  );
}