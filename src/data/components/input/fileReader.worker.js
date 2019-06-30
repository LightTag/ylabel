function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result);
        };

        reader.onerror = reject;

        reader.readAsText(file);
    })
}
export const readAndParseFile = async (file) =>{
    const contents = await readFileAsync(file);
    const data = JSON.parse(contents);
    return data

}