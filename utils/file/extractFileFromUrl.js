function extractFileNameFromUrl(url) {
    try {
        const decodedUrl = decodeURIComponent(url);
        const match = decodedUrl.match(/\/([^\/?]+)\?/);
        return match ? match[1] : null;
    } catch (error) {
        console.error('Error extracting file name:', error);
        return null;
    }
}


module.exports = extractFileNameFromUrl;