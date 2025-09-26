// Простой скрипт для запуска сбора данных
const { main } = require("./fetch-top50-teams")

console.log("Запуск сбора данных о топ-50 командах...")
main()
  .then(() => {
    console.log("Сбор данных завершен успешно!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Ошибка при сборе данных:", error)
    process.exit(1)
  })
