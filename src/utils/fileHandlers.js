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

        // Автоматически устанавливаем размер N равным количеству отсчётов (если передан)
        if (refs.N) {
            refs.N.value = values.length;
        }
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

    // формируем текст файла
    const content = output.value
        .map(c => `${c.re.toFixed(6)} ${c.im.toFixed(4)}`)
        .join("\n");

    // создаём Blob
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });

    // создаём временную ссылку
    const url = URL.createObjectURL(blob);

    // создаём <a> для скачивания
    const a = document.createElement("a");
    a.href = url;
    const NValue = typeof N === 'object' ? N.value : N;
    a.download = `${prefix}_N${NValue}.txt`;
    document.body.appendChild(a);
    a.click();

    // очистка
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

