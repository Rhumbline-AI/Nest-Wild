# Nest Wild Shopify Theme

This repository contains the Shopify theme for Nest Wild, featuring a modern design with product bundling capabilities and enhanced product detail pages.

## 🏗️ Project Structure

```
nw-theme-bundler-pdp-vibe/
├── assets/          # CSS, JS, images, and other static files
├── config/          # Theme configuration files
├── layout/          # Theme layout templates
├── locales/         # Translation files
├── sections/        # Reusable theme sections
├── snippets/        # Reusable code snippets
├── templates/       # Page templates
└── README.md        # This file
```

## 🚀 Features

- **Product Bundling**: Advanced product bundler functionality
- **Enhanced PDP**: Improved product detail pages with better UX
- **Responsive Design**: Mobile-first responsive design
- **Multi-language Support**: Internationalization ready
- **Custom Sections**: Modular, reusable theme sections

## 🔧 Development Workflow

### Branching Strategy

We use a structured branching strategy for safe deployments and rollback points:

- `main` - Production-ready code
- `develop` - Development branch for testing
- `feature/*` - Feature branches for new development
- `hotfix/*` - Emergency fixes for production

### Making Changes

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test thoroughly
4. Commit with descriptive messages: `git commit -m "feat: add new product bundler section"`
5. Push to your feature branch: `git push origin feature/your-feature-name`
6. Create a pull request to merge into `develop`
7. After testing, merge to `main` for production deployment

### Rollback Points

Before deploying to production:
1. Ensure all changes are committed to `main`
2. Create a release tag: `git tag -a v1.2.3 -m "Release version 1.2.3"`
3. Push the tag: `git push origin v1.2.3`

To rollback:
1. Identify the version to rollback to: `git tag -l`
2. Checkout the specific version: `git checkout v1.2.3`
3. Deploy the rolled-back version

## 📦 Installation & Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/Rhumbline-AI/Nest-Wild.git
   cd nw-theme-bundler-pdp-vibe
   ```

2. Install Shopify CLI (if not already installed):
   ```bash
   npm install -g @shopify/cli @shopify/theme
   ```

3. Connect to your Shopify store:
   ```bash
   shopify theme dev
   ```

## 🛠️ Development Commands

- `shopify theme dev` - Start development server
- `shopify theme push` - Deploy theme to Shopify
- `shopify theme pull` - Download theme from Shopify
- `shopify theme check` - Validate theme files

## 📝 Commit Convention

We follow conventional commits for better changelog generation:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## 🔄 Deployment

### Staging Deployment
1. Merge feature branches to `develop`
2. Test on staging environment
3. Create pull request to `main`

### Production Deployment
1. Merge `develop` to `main`
2. Create release tag
3. Deploy to production using Shopify CLI or admin

## 🆘 Rollback Process

If issues arise in production:

1. **Immediate Rollback**:
   ```bash
   git checkout v1.2.2  # Previous stable version
   shopify theme push
   ```

2. **Investigate Issue**:
   - Create hotfix branch: `git checkout -b hotfix/fix-production-issue`
   - Fix the issue
   - Test thoroughly
   - Deploy hotfix

## 📞 Support

For questions or issues:
- Create an issue in this repository
- Contact the development team
- Check Shopify documentation for theme development

## 📄 License

This project is proprietary to Nest Wild. All rights reserved.
