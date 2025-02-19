# BuildY - Visual Layout Builder

BuildY - это визуальный конструктор макетов с использованием Tailwind CSS и shadcn компонентов.

## Начало работы

### Выбор компонентов
1. Откройте демо-сайт: [https://vue-uikit-shadcn.vercel.app/](https://vue-uikit-shadcn.vercel.app/)
2. Просматривайте компоненты и добавляйте понравившиеся в избранное (значок закладки справа)
3. В навбаре появится кнопка "BuildY" после добавления первого компонента

### Настройка темы
- Используйте значок настроек в навбаре для конфигурации:
  - Шрифты
  - Цветовая схема
  - Радиус скругления

### Конструктор BuildY

1. Нажмите кнопку "BuildY" для перехода в конструктор
2. Нажмите "Get Blocks" для загрузки выбранных компонентов

### Инструменты

#### Tools
- Настройка макета
- Доступ к конфигурации
- Простой редактор в навбаре

#### Взаимодействие
- Фиолетовая подсветка для секций
- Подсветка отдельных элементов при наведении

### Экспорт

1. Экспортируйте в HTML когда макет готов
2. Доступны два режима:
   - Dev: Tailwind как CDN для дальнейшей разработки
   - Prod: Стили в head для финальной версии

### Дополнительные возможности

#### Сохранение проекта
- Экспорт проекта в JSON
- Импорт ранее сохраненного проекта

#### Импорт секций
- В навбаре доступен импорт секций
- Поддерживается вставка любого Tailwind блока между тегами `<section>`
- Поддержка компонентов из:
  - [https://ui.pro.hinddy.com/components](https://ui.pro.hinddy.com/components) (HTML версия)
  - Любые секции с поддержкой shadcn темы

### Готовые примеры

В папке [examples](https://github.com/alexy-os/layouter/tree/main/buildy/examples) доступны готовые наборы компонентов:

- `all-ui-font-nunito-blue-color.json` - Полный набор компонентов с Nunito шрифтом и синей цветовой схемой
- `buildy-starter-font-saira.json` - Компоненты из Vue Starter проекта
- `hinddy-ui-font-nunito.json` - Компоненты из Hinddy UI

Для использования:
1. Откройте BuildY. В Tools жмите: Reset и затем Import.
2. Импортируйте нужный JSON файл из папки [examples](https://github.com/alexy-os/layouter/tree/main/buildy/examples)
3. Настройте под свои потребности

### Темы

Пройдите на сайт [shadcn/ui](https://ui.shadcn.com/themes) и выберите тему. Затем, в настройках макета в Tools жмите: Layout Setting и в поле Tailwind Styles вставьте код темы. Сохраните настройки и перезагрузите страницу.

Поддержка dark mode из коробки. Возможна реализация собственной темы через настройки макета.

## Рекомендации

1. Изучите все доступные блоки перед началом работы
2. Настройте тему до начала компоновки макета
3. Используйте экспорт в JSON для сохранения промежуточных версий
4. В Dev режиме экспорта можно дорабатывать стили через Tailwind
5. Prod режим использовать только для финальной версии

## Поддержка

Telegram: [@alexy_os](https://t.me/alexy_os)

BuildY поддерживает все современные браузеры. Рекомендуется использовать десктопную версию для удобства работы.