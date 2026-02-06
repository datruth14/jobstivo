
const https = require('https');

const API_KEY = '5610a7ac65msh4d0a6097cbc1856p11ce87jsn50aa56717b7c';
const JOB_ID = 'Qi5iC3sFP0h5Pj7LAAAAAA==';

function fetchJob(id) {
    const encodedId = encodeURIComponent(id);
    const options = {
        method: 'GET',
        hostname: 'jsearch.p.rapidapi.com',
        path: `/job-details?job_id=${encodedId}`,
        headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': 'jsearch.p.rapidapi.com'
        }
    };

    console.log(`Fetching job with ID: ${id}`);
    console.log(`Encoded ID: ${encodedId}`);
    console.log(`URL: https://${options.hostname}${options.path}`);

    const req = https.request(options, (res) => {
        let chunks = [];

        res.on('data', (chunk) => {
            chunks.push(chunk);
        });

        res.on('end', () => {
            const body = Buffer.concat(chunks);
            console.log(`Status Code: ${res.statusCode}`);
            try {
                const data = JSON.parse(body.toString());
                console.log('Response:', JSON.stringify(data, null, 2));
            } catch (e) {
                console.log('Raw Body:', body.toString());
            }
        });
    });

    req.on('error', (e) => {
        console.error('Request Error:', e);
    });

    req.end();
}

fetchJob(JOB_ID);
