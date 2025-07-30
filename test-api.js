const OpenAI = require('openai');

// 测试API密钥的函数
async function testApiKey(apiKey) {
    console.log('Testing DeepSeek API key...');
    console.log('API Key (first 10 chars):', apiKey.substring(0, 10) + '...');
    
    try {
        const openai = new OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey: apiKey.trim()
        });

        console.log('Sending test request...');
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: "Hello, this is a test message." }],
            model: "deepseek-chat",
            max_tokens: 50
        });

        console.log('✅ API key is valid!');
        console.log('Response:', completion.choices[0].message.content);
        return true;
    } catch (error) {
        console.log('❌ API key test failed:');
        console.log('Error:', error.message);
        
        if (error.status === 401) {
            console.log('\n🔍 Troubleshooting tips:');
            console.log('1. Make sure your API key is correct');
            console.log('2. Check if your DeepSeek account is active');
            console.log('3. Verify you have sufficient credits');
            console.log('4. Ensure the API key format is correct (should be a long string)');
        }
        
        return false;
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const apiKey = process.argv[2];
    
    if (!apiKey) {
        console.log('Usage: node test-api.js <your-api-key>');
        console.log('Example: node test-api.js sk-1234567890abcdef...');
        process.exit(1);
    }
    
    testApiKey(apiKey).then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { testApiKey }; 