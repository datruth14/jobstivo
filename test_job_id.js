
const { getJobById } = require('./src/app/actions/jobs');

async function test() {
    console.log("Testing getJobById with ID: Qi5iC3sFP0h5Pj7LAAAAAA==");
    try {
        const result = await getJobById("Qi5iC3sFP0h5Pj7LAAAAAA==");
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
