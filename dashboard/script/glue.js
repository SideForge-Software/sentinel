
const fs = require('fs');
const yaml = require('js-yaml'); // Make sure to install the 'js-yaml' package using npm install js-yaml

const enviornment = process.argv[2];

const getPathForConfig = () => { 

  return process.argv[2] === "dev" ? "../config/config.yaml" : "./config.yaml";
  
}

const getPathForQuestions = () => {
  return process.argv[2] === "dev" ? "../config/suggested-questions.yaml" : "./suggested-questions.yaml";
}

const updateEnvFile = (configObject) => {

  try {
    const envContent = [
      `# Auto uploaded from glue config: ${ enviornment } (environment)`,
      `NEXT_PUBLIC_SUPABASE_KEY=${configObject.supabase[enviornment].anon_public_key}`,
      `NEXT_PUBLIC_SUPABASE_URL=${configObject.supabase[enviornment].url}`,
      `NEXT_PUBLIC_API_URL=${ enviornment == "dev" ? "http://" + configObject.server.host + ":" + configObject.server.port + "/api" : configObject.server.prod_api_url + "/api" }`,
    ].join("\n")


    // Update or create the .env file
    fs.writeFileSync('.env.local', envContent);

    console.log('[GLUE] .env file updated successfully.');
  } catch (err) {
    console.error(`Error updating .env file: ${err.message}`);
  }
};

const configFile = getPathForConfig();
const questionFile = getPathForQuestions();

// Read the contents of the YAML file
try {
  const yamlContent = fs.readFileSync(configFile, 'utf8');
  const configObject = yaml.load(yamlContent);

  // Now 'configObject' contains the parsed YAML data as a JavaScript object
  console.log("[GLUE] Found the configuration, updating .env now.");

  updateEnvFile(configObject);
} catch (err) {
  console.error(`[GLUE] Error reading ${configFile}: ${err.message}`);
}
