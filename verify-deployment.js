#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const crypto = require('crypto');

console.log('🔍 Clockwork Elite Deployment Verification\n');

// Read local file
const localContent = fs.readFileSync('index.html', 'utf8');
const localHash = crypto.createHash('md5').update(localContent).digest('hex');

// Check for key changes that should be present
const expectedChanges = [
    { feature: 'Confirm button', search: 'Confirm & Continue' },
    { feature: 'No Force Refresh', search: 'forceRefresh', shouldExist: false },
    { feature: 'No emoji icons', search: '💾', shouldExist: false },
    { feature: 'Work hours 8-4', search: '8:00 AM - 4:00 PM' },
    { feature: 'Generate button text', search: 'Generate</button>' },
    { feature: 'Early Morning option', search: 'Early Morning (8:00 AM - 10:00 AM)' },
    { feature: 'Preview count adjustment', search: 'adjustTaskCount' },
    { feature: 'No Quick Generate', search: 'quickGenerate', shouldExist: false }
];

// Check local file first
console.log('📁 Checking local file...');
let localPassed = 0;
expectedChanges.forEach(change => {
    const exists = localContent.includes(change.search);
    const expected = change.shouldExist !== false;
    const passed = exists === expected;
    
    console.log(`  ${passed ? '✅' : '❌'} ${change.feature}: ${passed ? 'OK' : 'FAILED'}`);
    if (passed) localPassed++;
});

console.log(`\nLocal file check: ${localPassed}/${expectedChanges.length} passed\n`);

// Fetch deployed version
console.log('🌐 Fetching deployed version from GitHub Pages...');

https.get('https://rpeart73.github.io/clockwork-elite/', (res) => {
    let deployedContent = '';
    
    res.on('data', (chunk) => {
        deployedContent += chunk;
    });
    
    res.on('end', () => {
        const deployedHash = crypto.createHash('md5').update(deployedContent).digest('hex');
        
        console.log('\n📊 Deployment Status:');
        console.log(`  Local hash:    ${localHash}`);
        console.log(`  Deployed hash: ${deployedHash}`);
        console.log(`  Match:         ${localHash === deployedHash ? '✅ SYNCED' : '❌ OUT OF SYNC'}\n`);
        
        // Check deployed version
        console.log('🔍 Checking deployed features...');
        let deployedPassed = 0;
        expectedChanges.forEach(change => {
            const exists = deployedContent.includes(change.search);
            const expected = change.shouldExist !== false;
            const passed = exists === expected;
            
            console.log(`  ${passed ? '✅' : '❌'} ${change.feature}: ${passed ? 'OK' : 'MISSING/UNEXPECTED'}`);
            if (passed) deployedPassed++;
        });
        
        console.log(`\nDeployed check: ${deployedPassed}/${expectedChanges.length} passed\n`);
        
        // Summary
        if (deployedPassed === expectedChanges.length) {
            console.log('✅ SUCCESS: All changes are deployed correctly!');
        } else {
            console.log('❌ WARNING: Some changes are missing from deployment.');
            console.log('\n💡 Try these steps:');
            console.log('   1. Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)');
            console.log('   2. Clear browser cache and cookies');
            console.log('   3. Open in incognito/private mode');
            console.log('   4. Wait 5 minutes for GitHub Pages to update');
            console.log('   5. Visit: https://rpeart73.github.io/clockwork-elite/?v=' + Date.now());
        }
        
        // Show last commit info
        console.log('\n📝 Last Git Commit:');
        require('child_process').exec('git log -1 --oneline', (err, stdout) => {
            if (!err) console.log('   ' + stdout.trim());
        });
    });
}).on('error', (err) => {
    console.error('❌ Error fetching deployed version:', err.message);
});