# Deployment Checklist

## Pre-Deployment

- [ ] All tests passing
- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] Code reviewed and committed

## Build

```bash
# Clean previous build
rm -rf dist/

# Build for production
npm run build

# Verify build output
ls -la dist/LubomirOfSlavigrad/browser/
```

## Verify Critical Files

```bash
# Check that 404.html exists (for GitHub Pages SPA routing)
ls dist/LubomirOfSlavigrad/browser/404.html

# Check that index.html has the redirect script
grep "GitHub Pages SPA redirect" dist/LubomirOfSlavigrad/browser/index.html

# Check that CNAME exists (for custom domain)
cat dist/LubomirOfSlavigrad/browser/CNAME
```

Expected output:
- ✅ `404.html` exists
- ✅ `index.html` contains redirect script
- ✅ `CNAME` contains `slavigrad.net`

## Deploy to GitHub Pages

### Option 1: Manual Deployment

```bash
# Navigate to the browser folder
cd dist/LubomirOfSlavigrad/browser/

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Deploy to GitHub Pages"

# Add remote (replace with your repo)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to gh-pages branch
git push -f origin main:gh-pages

# Go back to project root
cd ../../..
```

### Option 2: Using gh-pages package

```bash
# Install gh-pages if not already installed
npm install --save-dev gh-pages

# Add to package.json scripts:
# "deploy": "gh-pages -d dist/LubomirOfSlavigrad/browser"

# Deploy
npm run deploy
```

## Post-Deployment Verification

### 1. Check GitHub Pages Settings

- Go to your repository on GitHub
- Settings → Pages
- Verify:
  - [ ] Source is set to `gh-pages` branch
  - [ ] Custom domain is `slavigrad.net`
  - [ ] HTTPS is enforced

### 2. Test Direct URL Access

Open these URLs in a **new incognito window** (to avoid cache):

- [ ] `https://slavigrad.net/` - Home page loads
- [ ] `https://slavigrad.net/egypt-story` - Egypt Story page loads (no 404!)
- [ ] `https://slavigrad.net/egypt-story#chapter-3` - Loads and scrolls to chapter 3

### 3. Test Navigation

- [ ] Click navigation links - all routes work
- [ ] Refresh page on any route - no 404 error
- [ ] Browser back/forward buttons work correctly

### 4. Test Chapter Navigation

- [ ] Click on a chapter in the sidebar
- [ ] Verify it navigates AND shows active state immediately (single click)
- [ ] Verify correct chapter is highlighted (no race condition)

### 5. Performance Check

- [ ] Open DevTools → Network tab
- [ ] Check page load time
- [ ] Verify no console errors
- [ ] Check Lighthouse score (optional)

## Rollback Plan

If something goes wrong:

```bash
# Revert to previous deployment
git checkout gh-pages
git reset --hard HEAD~1
git push -f origin gh-pages
```

## Common Issues

### Issue: 404 on direct URL access

**Check**:
```bash
# Verify 404.html exists in deployed site
curl https://slavigrad.net/404.html
```

**Fix**: Ensure `public/404.html` is in your project and rebuild

### Issue: Custom domain not working

**Check**:
```bash
# Verify CNAME file
curl https://slavigrad.net/CNAME
```

**Fix**: Ensure `public/CNAME` contains `slavigrad.net`

### Issue: Old version still showing

**Fix**: 
- Clear browser cache
- Wait 5-10 minutes for GitHub Pages to update
- Check if you deployed the correct folder

## Success Criteria

✅ All routes accessible via direct URL  
✅ No 404 errors on page refresh  
✅ Chapter navigation works with single click  
✅ Correct chapter highlighted after navigation  
✅ Custom domain working  
✅ HTTPS enabled  
✅ No console errors  

## Notes

- GitHub Pages can take 5-10 minutes to update after deployment
- Always test in incognito mode to avoid cache issues
- The 404.html redirect happens instantly and is invisible to users
- The redirect script runs before Angular loads, so there's no performance impact

## Deployment Frequency

- **Bug fixes**: Deploy immediately after testing
- **New features**: Deploy after thorough testing
- **Content updates**: Can deploy anytime

## Monitoring

After deployment, monitor:
- [ ] Google Analytics (if configured)
- [ ] Error tracking (if configured)
- [ ] User feedback
- [ ] GitHub Pages status

---

**Last Updated**: 2025-10-09  
**Next Review**: After next major feature deployment

