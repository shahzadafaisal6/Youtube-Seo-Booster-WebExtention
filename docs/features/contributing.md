# Contributing to YouTube SEO Booster

We love your input! We want to make contributing to YouTube SEO Booster as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Setup

1. **Prerequisites**
   - Node.js (v14 or higher)
   - npm or yarn
   - Chrome browser
   - Git

2. **Local Development**
   ```bash
   # Clone your fork
   git clone https://github.com/YOUR_USERNAME/Youtube-Seo-Booster-WebExtention.git
   cd Youtube-Seo-Booster-WebExtention

   # Install dependencies
   npm install

   # Run in development mode
   npm run dev
   ```

3. **Loading the Extension**
   - Open Chrome
   - Navigate to `chrome://extensions/`
   - Enable Developer Mode
   - Click "Load unpacked"
   - Select the `dist` folder

## Code Style Guide

### JavaScript/TypeScript

- Use ES6+ features
- Follow Airbnb JavaScript Style Guide
- Use TypeScript for new features
- Maintain type definitions

### CSS

- Use BEM naming convention
- Maintain responsive design
- Follow mobile-first approach
- Use CSS variables for theming

### Documentation

- Keep README.md up to date
- Document all functions and classes
- Include JSDoc comments
- Update changelog

## Testing

1. **Unit Tests**
   ```bash
   # Run unit tests
   npm test

   # Run tests in watch mode
   npm test:watch
   ```

2. **Integration Tests**
   ```bash
   # Run integration tests
   npm run test:integration
   ```

3. **End-to-End Tests**
   ```bash
   # Run E2E tests
   npm run test:e2e
   ```

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the CHANGELOG.md with notes on your changes
3. The PR will be merged once you have the sign-off of two maintainers

## Issue Reporting

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening)

## License

By contributing, you agree that your contributions will be licensed under its MIT License.