const axios = require('axios');

async function test() {
    try {
        const res = await axios.get('http://localhost:5000/api/user/chats');
        console.log(res.data);
    } catch (err) {
        if (err.response) {
            console.log('Status:', err.response.status);
            console.log('Data:', err.response.data);
        } else {
            console.log('Error:', err.message);
        }
    }
}

test();
