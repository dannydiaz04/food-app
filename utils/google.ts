export function formatPrivateKey(rawKey: string): string {
  // Extract just the private key portion using regex
  const keyMatch = rawKey.match(/-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/);
  if (!keyMatch) {
    throw new Error('Invalid private key format');
  }
  
  // Clean up the private key string
  const formattedKey = keyMatch[0]
    .replace(/\\n/g, '\n')    // Replace \n with newlines
    .replace(/\\\\/g, '')     // Remove double backslashes
    .replace(/\\/g, '')       // Remove single backslashes
    .replace(/"/g, '')        // Remove double quotes
    .replace(/'/g, '')        // Remove single quotes
    .split('\n')              // Split into lines
    .map(line => line.trim()) // Trim each line
    .join('\n')               // Join back with newlines
    .trim();
  
  return formattedKey;
}
