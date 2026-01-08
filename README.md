# Pokhara Manor - Restaurant Website

A modern, responsive restaurant website for Pokhara Manor, featuring Nepalese and Indian cuisine.

## Features

- **Responsive Design**: Fully responsive layout that works on all devices
- **Interactive Menu**: Filterable menu categories (Starters, Mains, Tandoori, Biryani, Desserts)
- **Image Gallery**: Showcase of dishes and restaurant ambiance
- **Online Reservation**: Contact form for table reservations
- **Smooth Animations**: Scroll animations and transitions
- **Mobile-Friendly Navigation**: Hamburger menu for mobile devices

## Structure

```
Pokhara/
├── index.html          # Main HTML file
├── styles.css          # CSS stylesheet
├── script.js           # JavaScript functionality
├── images/             # Image directory (add your images here)
│   ├── dish1.jpg
│   ├── dish2.jpg
│   ├── dish3.jpg
│   ├── dish4.jpg
│   ├── interior1.jpg
│   ├── interior2.jpg
│   └── restaurant-interior.jpg
└── README.md           # This file
```

## Setup

1. Clone or download this project
2. Add your restaurant images to the `images/` folder
3. Update contact information in `index.html`:
   - Address
   - Phone number
   - Email
   - Opening hours
4. Open `index.html` in a web browser

## Customization

### Colors
Edit the CSS variables in `styles.css`:
```css
:root {
    --primary-color: #d4af37;    /* Gold */
    --secondary-color: #8b4513;  /* Brown */
    --dark-bg: #1a1a1a;          /* Dark background */
    --light-bg: #f8f8f8;         /* Light background */
}
```

### Menu Items
Edit the menu items in `index.html` within the `<section class="menu">` section.

### Images
Replace placeholder image paths with your actual images:
- `images/dish1.jpg` - `images/dish4.jpg`: Food photos
- `images/interior1.jpg` - `images/interior2.jpg`: Restaurant interior
- `images/restaurant-interior.jpg`: About section image

## Technologies Used

- HTML5
- CSS3 (Flexbox, Grid, Animations)
- JavaScript (ES6+)
- Google Fonts (Playfair Display, Poppins)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## License

This is a demo project. Feel free to use and modify as needed.

## Note

This is a replica/demo website. Replace all placeholder content, images, and contact information with actual data before deployment.
