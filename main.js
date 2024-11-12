const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');

const BUILD_DIRECTORY = './build';
const SRC_DIRECTORY = './src';
const FILES_EXTENSION = '.ahmed0saber';
const VARIABLES = {
    index: {
        name: "Ahmed Saber",
        title: "Software Developer",
        isAvaliable: false,
        skills: ["HTML", "CSS", "JavaScript"]
    },
    contact: {
        username: "ahmed0saber"
    }
};

const writeFileToDirectory = async (fileName, content) => {
    const dirPath = path.join(__dirname, BUILD_DIRECTORY);
    const filePath = path.join(dirPath, `${fileName}.html`);

    const directoryExists = fs.existsSync(dirPath);
    if (!directoryExists) {
        try {
            await fsPromises.mkdir(dirPath, { recursive: true });
        } catch (err) {
            console.error(`Error making directory ${dirPath}: ${err}`);
        }
    }

    try {
        await fsPromises.writeFile(filePath, content);
    } catch (err) {
        console.error(`Error writing to file ${filePath}: ${err}`);
    }
};

const compileTemplate = (fileName, content) => {
    const TEMPLATE_PATTERN = /<{\s*(.+?)\s*}>/g;

    return content.replace(TEMPLATE_PATTERN, (_match, variable) => {
        const CONDITIONAL_PATTERN = /^(\w+)\s*\?\s*\((.*)\)\s*:\s*\((.*)\)$/;
        const conditionalMatch = variable.match(CONDITIONAL_PATTERN);
        if (conditionalMatch) {
            const [_, condition, contentIfTrue, contentIfFalse] = conditionalMatch;
            const conditionValue = VARIABLES[fileName][condition];

            return conditionValue ? contentIfTrue : contentIfFalse;
        }

        const LOOP_PATTERN = /^(\w+)\s*=>\s*\((.*)\)\s*$/;
        const loopMatch = variable.match(LOOP_PATTERN);
        if (loopMatch) {
            const [_, listName, itemContent] = loopMatch;
            const list = VARIABLES[fileName][listName];

            return list.map(item => itemContent.trim().replace(`#${listName}`, item)).join("")
        }

        return VARIABLES[fileName][variable] || `<{ "${variable}" is not found! }>`;
    });
}

const getFileNameWithoutExtension = (fileName) => {
    return path.parse(fileName).name;
};

const compileFile = async (directory, file) => {
    try {
        const filePath = path.join(directory, file);
        const fileContent = await fsPromises.readFile(filePath, { encoding: 'utf8' });
        const fileName = getFileNameWithoutExtension(file);
        const compiledContent = compileTemplate(fileName, fileContent);
        await writeFileToDirectory(fileName, compiledContent);
        console.log(`File compiled successfully: ${filePath}`)
    } catch (err) {
        console.error(`Error reading file ${file}: ${err}`);
    }
}

const readFilesInDirectory = async (directory) => {
    const files = await fsPromises.readdir(directory);
    const filteredFiles = files.filter(file => file.endsWith(FILES_EXTENSION));

    return filteredFiles;
}

const compileTemplateFiles = async (directory) => {
    try {
        const files = await readFilesInDirectory(directory);
        files.forEach(file => compileFile(directory, file));
    } catch (err) {
        console.error(`Unable to read directory ${directory}: ` + err);
    }
};

compileTemplateFiles(SRC_DIRECTORY);
