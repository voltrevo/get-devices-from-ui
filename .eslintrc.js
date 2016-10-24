module.exports = {
    "extends": "airbnb",
    "installedESLint": true,
    "plugins": [
        "react",
        "jsx-a11y",
        "import"
    ],
    "rules": {
        "strict": 0,
        "new-cap": 0,
        "no-loop-func": 0,
        "no-constant-condition": 0,
        "no-return-assign": 0,
        "object-curly-spacing": 0,
        "no-nested-ternary": 0,
        "import/no-extraneous-dependencies": [
            "error",
            { "devDependencies": true }
        ]
    },
    "env": {
        "browser": true,
        "node": true
    }
};
