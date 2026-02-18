/**
 * Функция для чтения данных из файла
 * @param {Event} event - событие изменения файла
 * @param {Object} refs - объект с реактивными переменными
 * @param {Ref} refs.fileExist - флаг существования файла
 * @param {Ref} refs.inputText - текст входных данных
 * @param {Ref} refs.N - размер N (опционально, для автоматической установки)
 */
export function onFileChange(event, refs) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".txt")) {
        alert("Поддерживаются только .txt файлы");
        return;
    }

    refs.fileExist.value = true;

    const reader = new FileReader();

    reader.onload = e => {
        const text = e.target.result;

        // разбиваем по запятым и переводам строки
        const values = text
            .split(/[\s,]+/)
            .map(v => parseFloat(v))
            .filter(v => !isNaN(v));

        if (values.length === 0) {
            alert("Файл не содержит числовых данных");
            return;
        }

        // обновляем inputText → всё остальное пересчитается автоматически
        refs.inputText.value = values.join(",");

    };

    reader.readAsText(file);
}

/**
 * Функция для скачивания файла с результатами
 * @param {ComputedRef} output - вычисляемый результат (массив комплексных чисел)
 * @param {Ref|Number} N - размер N для имени файла
 * @param {String} prefix - префикс для имени файла (по умолчанию "dft")
 */
export function downloadFile(output, N, prefix = "dft") {

    if (!output.value || output.value.length === 0) {
        alert("Нет данных для сохранения");
        return;
    }

    let data = [];

    // если 2D массив
    if (Array.isArray(output.value[0])) {

        for (let i = 0; i < output.value.length; i++) {
            for (let j = 0; j < output.value[i].length; j++) {
                data.push(output.value[i][j]);
            }
        }

    } else {
        // 1D массив
        data = output.value;
    }

    const content = data
        .map(c => `${c.re.toFixed(3)} ${c.im.toFixed(3)}`)
        .join("\n");

    const blob = new Blob([content], {
        type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;

    const NValue = typeof N === 'object' ? N.value : N;
    a.download = `${prefix}_N${NValue}.txt`;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/* Для лаб7
 * Для разбиения на матрицу
*/
function reshapeTo2D(values) {

    const N = values.length;

    const rows = Math.floor(Math.sqrt(N));
    const cols = Math.ceil(N / rows);

    const paddedSize = rows * cols;

    const padded = [...values];

    while (padded.length < paddedSize) {
        padded.push(0);
    }

    const matrix = [];

    for (let i = 0; i < rows; i++) {
        const row = padded.slice(i * cols, (i + 1) * cols);
        matrix.push(row);
    }

    return matrix;
}

/* Сам обработчик */
export function onFileChange2D(event, refs) {

    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".txt")) {
        alert("Поддерживаются только .txt файлы");
        return;
    }

    refs.fileExist.value = true;

    const reader = new FileReader();

    reader.onload = e => {

        const text = e.target.result;

        const values = text
            .split(/[\s,]+/)
            .map(v => parseFloat(v))
            .filter(v => !isNaN(v));

        if (values.length === 0) {
            alert("Файл не содержит числовых данных");
            return;
        }

        const matrix = reshapeTo2D(values);

        // Преобразуем в формат "1,2,3;4,5,6"
        const formatted = matrix
            .map(row => row.join(","))
            .join(";");

        refs.inputText.value = formatted;
    };

    reader.readAsText(file);
}
