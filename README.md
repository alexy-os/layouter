# Layouter UI

> ⚠️ **IMPORTANT NOTICE**
> 
> The constructor is in the active development stage. Please note the following features:
> - The final export and proportions of elements directly depend on the screen size used for development
> - For correct operation, it is recommended to use a screen of at least 1024px (lg)
> - Changes in the operation of tools and export mechanics are possible
> - The current version is intended for testing and feedback collection

> "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away" - Antoine de Saint-Exupéry

## The Most Elegant Approach to UI Design

Layouter is not just another design tool – it's a philosophical statement about simplicity. While others offer endless toolbars that would make Swiss Army knives blush, we've distilled interface design to its purest essence: a rectangle and some text.

## The Power of Two

Just as a proper cup of Earl Grey needs only tea and water, Layouter needs only two tools:

### 🟦 The Rectangle
The foundation of all interfaces. Think of it as the Lego bricks that built an empire:
- Buttons? A rectangle with rounded corners
- Cards? A rectangle with a shadow
- Headers? A rather wide rectangle
- Modals? A rectangle that knows how to make an entrance

### 📝 The Text
Because even the finest architecture needs proper signage:
- Perfectly positioned
- Tailwind-powered styling
- No unnecessary formatting faff
- Just the essentials: size, alignment, and weight

## Tailwind: Our Faithful Butler

Every rectangle and text element is impeccably dressed in Tailwind utilities:
```html
<!-- A properly dressed rectangle -->
<div class="absolute bg-blue-500 rounded-xl w-48 h-24">
  <!-- A well-mannered text -->
  <span class="text-gray-800 text-xl font-bold text-center">
    Precisely positioned, old chap!
  </span>
</div>
```

## The BuildY Integration: a match made with love for HinddY

Coming soon: Clever algorithms to pick shadcn/ui blocks right while drawing your rectangles in Layouter.

### How It Works
1. Draw your interface with rectangles
2. Layouter analyses your composition
3. BuildY suggests matching shadcn/ui components
4. You select your favourites with a gentlemanly click

### The Roadmap

#### Phase 1: The Foundation (Current)
- ✅ Rectangle and text tools
- ✅ Drag-and-drop precision
- ✅ Tailwind utility exports
- ✅ Dark mode (for those long designers nights)

#### Phase 2: The Intelligence (Q1 2025)
- 🔄 Pattern recognition for common UI elements
- 🔄 Integration with shadcn/ui component library
- 🔄 Smart component suggestions
- 🔄 One-click component favouriting

#### Phase 3: The Refinement (Q2 2025)
- 📅 Automatic layout optimization
- 📅 Component variation suggestions
- 📅 Theme customization
- 📅 Export to BuildY projects

## Getting Started

```bash
# Clone with British precision
git clone https://github.com/alexy-os/layouter.git

# Enter the establishment
cd layouter

# Start the service
# (No tea will be served, unfortunately)
```

## The Philosophy

Why complicate what can be simple? With the approach of true perfectionists:
- Every interface is a composition of rectangles
- Every rectangle can be a component
- Every component should be precisely placed
- And everything should work together like a well-oiled machine

## The Future

Imagine designing your interface as easily as arranging furniture in a proper English manor:
1. Draw your layout with rectangles
2. Add text where needed
3. Click suggested components
4. Export to BuildY
5. Have a cup of tea while your interface assembles itself

## Contributing

We welcome contributions with the same enthusiasm as a proper English garden welcomes spring flowers. Do mind the coding standards – we're quite particular about those.

## License

MIT - As free as speech, not as free as tea.

---

*"In simplicity lies the ultimate sophistication" - Leonardo da Vinci (who would have loved Layouter, we're quite certain)*