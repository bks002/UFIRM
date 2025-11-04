module.exports = {
    "extends": ["standard", "plugin:import/errors", "plugin:import/warnings"],
    "plugins": [
        "standard",
        "import"
    ],
    "rules": {
        "import/no-mutable-exports": "error"
    }
};
