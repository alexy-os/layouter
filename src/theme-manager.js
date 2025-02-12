export class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'light';
    this.initializeTheme();
  }

  initializeTheme() {
    // Apply saved theme on page load
    if (this.theme === 'dark' || 
        (!this.theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      this.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      this.theme = 'light';
    }
    
    // Save initial theme
    localStorage.setItem('theme', this.theme);
  }

  toggleTheme() {
    if (this.theme === 'light') {
      document.documentElement.classList.add('dark');
      this.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      this.theme = 'light';
    }
    
    // Save theme preference
    localStorage.setItem('theme', this.theme);
  }

  getCurrentTheme() {
    return this.theme;
  }
}