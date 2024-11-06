function extractFileNameFromUrl(url) {
    try {
        // Decode the URL to handle encoded characters
        const decodedUrl = decodeURIComponent(url);
        // Use regex to match the file name pattern after the last '/' and before the '?'
        const match = decodedUrl.match(/\/([^\/?]+)\?/);
        // Return the matched file name if it exists
        return match ? match[1] : null;
    } catch (error) {
        console.error('Error extracting file name:', error);
        return null;
    }
}


module.exports = extractFileNameFromUrl;