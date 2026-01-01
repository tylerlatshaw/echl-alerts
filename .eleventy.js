module.exports = function (eleventyConfig) {
    // Copy static assets straight through to /public
    eleventyConfig.addPassthroughCopy({ "static": "." });
    // Example: static/sw.js -> public/sw.js, static/icon-192.png -> public/icon-192.png

    return {
        dir: {
            input: "src",
            output: "public",
            includes: "_includes",
        },
    };
};