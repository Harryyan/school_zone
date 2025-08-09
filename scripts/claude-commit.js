#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI color codes
const colors = {
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function executeCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    return null;
  }
}

function showGitStatus() {
  console.log(colorize('\n📋 Current Git Status:', 'cyan'));
  console.log('─'.repeat(50));
  
  const status = executeCommand('git status --porcelain');
  if (!status || status.trim() === '') {
    console.log(colorize('✨ Working directory clean - nothing to commit', 'green'));
    return false;
  }
  
  const lines = status.trim().split('\n');
  lines.forEach(line => {
    const status = line.substring(0, 2);
    const file = line.substring(3);
    
    let statusColor = 'reset';
    let statusSymbol = '';
    
    if (status.includes('M')) {
      statusColor = 'yellow';
      statusSymbol = '📝 Modified: ';
    } else if (status.includes('A')) {
      statusColor = 'green';
      statusSymbol = '➕ Added: ';
    } else if (status.includes('D')) {
      statusColor = 'red';
      statusSymbol = '🗑️ Deleted: ';
    } else if (status.includes('R')) {
      statusColor = 'blue';
      statusSymbol = '📦 Renamed: ';
    } else if (status.includes('??')) {
      statusColor = 'magenta';
      statusSymbol = '❓ Untracked: ';
    }
    
    console.log(colorize(`${statusSymbol}${file}`, statusColor));
  });
  
  return true;
}

function getCommitTypes() {
  return [
    { type: 'feat', desc: '✨ New feature', emoji: '✨' },
    { type: 'fix', desc: '🐛 Bug fix', emoji: '🐛' },
    { type: 'docs', desc: '📚 Documentation', emoji: '📚' },
    { type: 'style', desc: '💎 Code style', emoji: '💎' },
    { type: 'refactor', desc: '♻️ Code refactoring', emoji: '♻️' },
    { type: 'perf', desc: '⚡ Performance', emoji: '⚡' },
    { type: 'test', desc: '🧪 Tests', emoji: '🧪' },
    { type: 'build', desc: '📦 Build system', emoji: '📦' },
    { type: 'ci', desc: '👷 CI/CD', emoji: '👷' },
    { type: 'chore', desc: '🔧 Maintenance', emoji: '🔧' },
    { type: 'env', desc: '🌍 Environment', emoji: '🌍' }
  ];
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function getCommitInfo() {
  console.log(colorize('\n🚀 Claude Code Commit Helper', 'bold'));
  console.log('─'.repeat(50));
  
  // Show commit types
  const types = getCommitTypes();
  console.log(colorize('\n📝 Select commit type:', 'cyan'));
  types.forEach((type, index) => {
    console.log(colorize(`${index + 1}. ${type.desc}`, 'reset'));
  });
  
  const typeChoice = await askQuestion(colorize('\nEnter number (1-11): ', 'yellow'));
  const selectedType = types[parseInt(typeChoice) - 1];
  
  if (!selectedType) {
    console.log(colorize('❌ Invalid selection', 'red'));
    process.exit(1);
  }
  
  // Get commit scope (optional)
  const scope = await askQuestion(colorize('\n📂 Scope (optional, e.g., auth, ui, api): ', 'yellow'));
  
  // Get commit message
  const message = await askQuestion(colorize('\n💬 Commit message (brief description): ', 'yellow'));
  if (!message.trim()) {
    console.log(colorize('❌ Commit message is required', 'red'));
    process.exit(1);
  }
  
  // Get detailed description (optional)
  const description = await askQuestion(colorize('\n📄 Detailed description (optional): ', 'yellow'));
  
  // Ask if this breaks anything
  const breaking = await askQuestion(colorize('\n💥 Breaking change? (y/N): ', 'yellow'));
  
  return {
    type: selectedType,
    scope: scope.trim(),
    message: message.trim(),
    description: description.trim(),
    breaking: breaking.toLowerCase().startsWith('y')
  };
}

function formatCommitMessage(commitInfo) {
  const { type, scope, message, description, breaking } = commitInfo;
  
  // Build the commit title
  let title = `${type.emoji} ${type.type}`;
  if (scope) {
    title += `(${scope})`;
  }
  if (breaking) {
    title += '!';
  }
  title += `: ${message}`;
  
  // Build the full commit message
  let fullMessage = title;
  
  if (description) {
    fullMessage += `\n\n${description}`;
  }
  
  if (breaking) {
    fullMessage += '\n\nBREAKING CHANGE: This commit contains breaking changes';
  }
  
  // Add Claude Code signature
  fullMessage += '\n\n🤖 Generated with Claude Code\n\nCo-Authored-By: Claude <noreply@anthropic.com>';
  
  return fullMessage;
}

function showCommitPreview(message) {
  console.log(colorize('\n📋 Commit Preview:', 'cyan'));
  console.log('─'.repeat(50));
  console.log(colorize(message, 'reset'));
  console.log('─'.repeat(50));
}

async function main() {
  const args = process.argv.slice(2);
  const shouldPush = args.includes('--push');
  const quickMode = args.includes('--quick');
  
  console.log(colorize('🎯 Auckland School Finder - Claude Code Commit', 'bold'));
  
  // Check git status
  const hasChanges = showGitStatus();
  if (!hasChanges) {
    rl.close();
    return;
  }
  
  try {
    let commitMessage;
    
    if (quickMode) {
      // Quick commit mode
      const message = args.find(arg => !arg.startsWith('--')) || 'Quick update';
      commitMessage = `🔧 chore: ${message}\n\n🤖 Generated with Claude Code\n\nCo-Authored-By: Claude <noreply@anthropic.com>`;
    } else {
      // Interactive mode
      const commitInfo = await getCommitInfo();
      commitMessage = formatCommitMessage(commitInfo);
      
      // Show preview
      showCommitPreview(commitMessage);
      
      const confirm = await askQuestion(colorize('\n✅ Commit with this message? (Y/n): ', 'green'));
      if (confirm.toLowerCase().startsWith('n')) {
        console.log(colorize('❌ Commit cancelled', 'yellow'));
        rl.close();
        return;
      }
    }
    
    // Add all files
    console.log(colorize('\n📦 Adding files...', 'cyan'));
    executeCommand('git add .');
    
    // Create commit
    console.log(colorize('💾 Creating commit...', 'cyan'));
    const escapedMessage = commitMessage.replace(/"/g, '\\"');
    executeCommand(`git commit -m "${escapedMessage}"`);
    
    console.log(colorize('✅ Commit created successfully!', 'green'));
    
    // Push if requested
    if (shouldPush) {
      console.log(colorize('\n🚀 Pushing to remote...', 'cyan'));
      const pushResult = executeCommand('git push');
      if (pushResult !== null) {
        console.log(colorize('✅ Pushed successfully!', 'green'));
      } else {
        console.log(colorize('❌ Push failed - you may need to push manually', 'red'));
      }
    } else {
      console.log(colorize('\n💡 Tip: Use --push flag to automatically push after commit', 'blue'));
      console.log(colorize('💡 Tip: Use --quick flag for fast commits', 'blue'));
    }
    
  } catch (error) {
    console.log(colorize(`❌ Error: ${error.message}`, 'red'));
  } finally {
    rl.close();
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log(colorize('\n❌ Commit cancelled by user', 'yellow'));
  rl.close();
  process.exit(0);
});

main();