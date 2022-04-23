module.exports = {
    git: {
        push: true,
    },
    npm: {
        publish: true,
    },
    github: {
        release: true,
        web: true,
    },
    plugins: {
        '@release-it/keep-a-changelog': {
            filename: 'CHANGELOG.md',
            addUnreleased: true,
            keepUnreleased: false,
            addVersionUrl: true,
        },
    },
};
