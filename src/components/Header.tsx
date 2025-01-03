import { Button } from "@/components/ui/button";
import { Moon, Sun, Globe2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/utils/translations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="p-4 text-center relative">
      <div className="absolute right-4 top-4 flex gap-2">
        <Select
          value={language}
          onValueChange={(value: Language) => setLanguage(value)}
        >
          <SelectTrigger className="w-[140px]">
            <Globe2 className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="pt">Português</SelectItem>
            <SelectItem value="ru">Русский</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
    </header>
  );
};

export default Header;