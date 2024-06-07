const fs = require("fs");

function environment(production) {
    return `/* eslint-disable */
export const environment: { ALPHA_URL: string, production: boolean } = {
    ALPHA_URL: "${process.env["ALPHA_URL"]}",
    production: ${production}
};
/* eslint-enable */
`;
}

fs.writeFileSync("src/environments/environment.ts", environment(false));
fs.writeFileSync("src/environments/environment.prod.ts", environment(true));
