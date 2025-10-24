# Frontend - Income & Expense Tracker

This is the frontend application for the Income & Expense Tracker, built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running (see BackEnd/README.md)

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment Setup**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
FrontEnd/
├── app/                 # Next.js 14 App Router
│   ├── auth/           # Authentication pages
│   │   ├── login/      # Login page
│   │   └── register/   # Registration page
│   ├── dashboard/      # Dashboard pages
│   │   ├── analytics/  # Analytics page
│   │   ├── categories/ # Categories management
│   │   ├── profile/    # User profile
│   │   ├── reports/    # Reports page
│   │   ├── settings/   # Settings page
│   │   └── transactions/ # Transaction management
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── providers.tsx   # Context providers
├── components/         # Reusable components
│   ├── DashboardChart.tsx
│   ├── Header.tsx
│   ├── LandingPage.tsx
│   ├── QuickActions.tsx
│   ├── RecentTransactions.tsx
│   └── Sidebar.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── lib/                # Utility libraries
│   └── api.ts          # API client
├── types/              # TypeScript type definitions
│   └── index.ts
├── next.config.js      # Next.js configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies
```

## 🎨 Features

### Pages

- **Landing Page**: Marketing page with feature overview
- **Authentication**: Login and registration forms
- **Dashboard**: Financial overview with charts and statistics
- **Transactions**: Transaction management with CRUD operations
- **Analytics**: Detailed financial analytics and reports
- **Categories**: Category management
- **Profile**: User profile and settings
- **Reports**: Financial reports and exports

### Components

- **Responsive Design**: Mobile-first approach
- **Interactive Charts**: Data visualization with Recharts
- **Form Management**: React Hook Form integration
- **State Management**: React Query for server state
- **Authentication**: JWT-based auth with context
- **Notifications**: Toast notifications
- **Loading States**: Skeleton loaders and spinners

## 🛠️ Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety and better development experience
- **Tailwind CSS**: Utility-first CSS framework
- **React Query**: Data fetching and caching
- **React Hook Form**: Form management
- **Recharts**: Data visualization
- **Lucide React**: Icon library
- **React Hot Toast**: Notifications
- **Date-fns**: Date manipulation
- **Axios**: HTTP client

## 🎯 Key Features

### Dashboard

- Financial summary cards
- Interactive charts and graphs
- Recent transactions list
- Quick action buttons
- Category breakdown

### Transaction Management

- Add/edit/delete transactions
- Category-based organization
- Search and filtering
- Pagination
- Bulk operations

### Analytics

- Monthly trend analysis
- Category-wise spending
- Income vs expense comparison
- Interactive visualizations
- Export capabilities

### User Experience

- Responsive design
- Dark/light theme support
- Keyboard shortcuts
- Loading states
- Error handling
- Offline support (planned)

## 🔧 Configuration

### Tailwind CSS

The project uses Tailwind CSS with custom configuration:

- Custom color palette
- Extended animations
- Custom components
- Responsive utilities

### TypeScript

Strict TypeScript configuration with:

- Path mapping for clean imports
- Strict type checking
- ESLint integration

### Next.js

Optimized Next.js configuration:

- App Router enabled
- Image optimization
- Environment variables
- Build optimization

## 📱 Responsive Design

The application is fully responsive with breakpoints:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🎨 UI Components

### Design System

- Consistent color palette
- Typography scale
- Spacing system
- Component variants

### Custom Components

- Button variants (primary, secondary, success, danger)
- Input components with validation
- Card layouts
- Modal dialogs
- Loading states

## 🔐 Authentication

### Auth Flow

1. User registration/login
2. JWT token storage
3. Protected routes
4. Automatic token refresh
5. Logout functionality

### Security Features

- Secure token storage
- Route protection
- Input validation
- XSS protection
- CSRF protection

## 📊 Data Management

### State Management

- **Server State**: React Query for API data
- **Client State**: React Context for auth
- **Form State**: React Hook Form
- **UI State**: Local component state

### API Integration

- Centralized API client
- Request/response interceptors
- Error handling
- Loading states
- Caching strategies

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

### Code Quality

- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- Component documentation

## 🚀 Deployment

### Build Process

```bash
npm run build
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### Deployment Platforms

- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **DigitalOcean App Platform**

### Vercel Deployment

1. Connect your GitHub repository
2. Configure environment variables
3. Deploy automatically on push

## 📈 Performance

### Optimization Features

- Next.js automatic optimization
- Image optimization
- Code splitting
- Lazy loading
- Bundle analysis

### Performance Metrics

- Lighthouse score optimization
- Core Web Vitals
- Bundle size optimization
- Runtime performance

## 🎯 SEO

### SEO Features

- Meta tags optimization
- Open Graph tags
- Structured data
- Sitemap generation
- Robot.txt

## 🔧 Customization

### Theme Customization

- Color palette modification
- Typography changes
- Component styling
- Layout adjustments

### Feature Extensions

- Additional chart types
- Export functionality
- Advanced filtering
- Bulk operations

## 🐛 Debugging

### Development Tools

- React Developer Tools
- Next.js debugging
- Browser DevTools
- Network monitoring

### Common Issues

- API connection problems
- Authentication issues
- Build errors
- Runtime errors

## 📚 Documentation

### Component Documentation

- Props interface
- Usage examples
- Styling options
- Accessibility notes

### API Integration

- Endpoint documentation
- Request/response formats
- Error handling
- Authentication flow

## 🤝 Contributing

### Development Guidelines

1. Follow TypeScript best practices
2. Use Tailwind CSS for styling
3. Write reusable components
4. Add proper error handling
5. Include loading states
6. Test on multiple devices

### Code Style

- ESLint configuration
- Prettier formatting
- Component naming conventions
- File organization

## 📞 Support

For frontend-specific issues:

1. Check browser console for errors
2. Verify API connection
3. Check environment variables
4. Review component documentation
5. Test on different browsers

## 🔮 Future Enhancements

- [ ] Progressive Web App (PWA)
- [ ] Offline functionality
- [ ] Advanced charts and visualizations
- [ ] Data export features
- [ ] Mobile app (React Native)
- [ ] Real-time updates
- [ ] Advanced filtering
- [ ] Bulk operations
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements
# incomeandexpensefrontend
