# voicing-telegram-bot

Бот для озвучивания сценариев и автоматической сборки готового архива с аудиофайлами.

---

# 🤖 Демо

[@voicing_telegram_bot](https://t.me/voicing_telegram_bot)

## ⚙️ Функционал

- **Машина состояний** — каждый шаг взаимодействия с ботом реализован как отдельное состояние
- **MessageRenderer** — автоматическое обновление текста и inline-клавиатуры в сообщении текущего состояния
- **Очередь событий** с асинхронной обработкой

## 🛠 Технологии

[![NodeJS](https://img.shields.io/badge/Node.js-6DA55F?logo=node.js&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](#)

## 📄 Формат сценария

Сценарий должен быть в формате **JSON**, например:

```json
[
	{
		"name": "Персонаж 1",
		"content": "Реплика 1",
		"id": "character1"
	},
	{
		"name": "Персонаж 2",
		"content": "Реплика 2",
		"id": "character2"
	}
]
```

**Пояснение:**

- name — имя персонажа
- content — текст реплики
- id — уникальный идентификатор персонажа

## 🔍 Пример сценария

📂 [scenario-example.json](scenario-example.json)
