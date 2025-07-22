# How to Update Clockwork Elite

## Quick Update Steps

1. **Edit the local file**:
   - Open `C:\Users\raymo\clockwork-elite\index.html` in any text editor
   - Make your changes
   - Save the file

2. **Commit your changes**:
   ```bash
   cd C:\Users\raymo\clockwork-elite
   git add index.html
   git commit -m "Describe your changes here"
   git push
   ```

3. **Wait 2-5 minutes** for GitHub Pages to update

## Common Changes

### Change default values:
- Search for `selected` to find default dropdown options
- Search for `value =` to find where values are set

### Add new service types:
- Find `<select id="serviceType"`
- Add new `<option>` tags

### Modify bullet templates:
- Search for `generateContextualBullet`
- Edit the template arrays

### Change colors/styling:
- Look in the `<style>` section at the top
- Modify CSS properties

## Example: Adding a New Service Type

1. Find this section in index.html:
```html
<select id="serviceType" class="form-input">
    <option value="Email Support">Email Support</option>
    <option value="Project Work">Project Work</option>
    <!-- Add your new option here -->
    <option value="Lab Support">Lab Support</option>
</select>
```

2. Save, then run:
```bash
cd C:\Users\raymo\clockwork-elite
git add index.html
git commit -m "Add Lab Support service type"
git push
```

## Tips
- Always test locally first by opening index.html in your browser
- Make small changes at a time
- Use descriptive commit messages
- GitHub Pages updates automatically after each push