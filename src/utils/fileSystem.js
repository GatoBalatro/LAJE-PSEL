const PREFIXES = ["backup", "log", "system", "config", "data", "temp", "cache", "user", "network", "win"];
const SUFFIXES = ["_old", "_new", "_final", "_v2", "_1998", "_dump", "_auto", "_sys"];
const EXTENSIONS = [".txt", ".log", ".sys", ".ini", ".cfg", ".bmp", ".dat", ".bin", ".exe"];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateFileSystem(config) {
  const { totalFiles, targetFile } = config;
  const files = [];

  // Gera arquivos falsos
  for (let i = 0; i < totalFiles - 1; i++) {
    const name = getRandomItem(PREFIXES) + getRandomItem(SUFFIXES);
    const ext = getRandomItem(EXTENSIONS);
    files.push({
      id: `fake_${i}`,
      name: name + ext,
      isTarget: false
    });
  }

  // Insere o arquivo alvo
  files.push({
    id: 'target_file',
    name: targetFile.name + targetFile.extension,
    isTarget: true
  });

  // Algoritmo de Fisher-Yates para embaralhar o array
  for (let i = files.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [files[i], files[j]] = [files[j], files[i]];
  }

  return files;
}