import { ThemeConfig } from '../interfaces';

export class ThemeManager {
  private currentTheme: 'light' | 'dark';

  constructor() {
    this.currentTheme = this.getInitialTheme();
    this.applyTheme(this.currentTheme);
  }

  private getInitialTheme(): 'light' | 'dark' {
    // Check local storage
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  public toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(this.currentTheme);
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }

  public getCurrentTheme(): ThemeConfig {
    return {
      mode: this.currentTheme,
      colors: this.getThemeColors(),
      fonts: {
        primary: 'Nunito',
        system: 'system-ui'
      }
    };
  }

  private getThemeColors(): Record<string, string> {
    const computedStyle = getComputedStyle(document.documentElement);
    return {
      background: computedStyle.getPropertyValue('--background'),
      foreground: computedStyle.getPropertyValue('--foreground'),
      primary: computedStyle.getPropertyValue('--primary'),
      secondary: computedStyle.getPropertyValue('--secondary'),
      accent: computedStyle.getPropertyValue('--accent'),
      muted: computedStyle.getPropertyValue('--muted'),
      border: computedStyle.getPropertyValue('--border')
    };
  }
} 