export const WORDS_LIST = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
  "write", "life", "me", "man", "many", "show", "long", "great", "right", "three", "old", "too", "mean", "feel", "place", "here", "high", "house", "small", "hand",
  "large", "another", "self", "different", "system", "always", "tell", "group", "try", "leave", "number", "same", "change", "point", "program", "course", "under", "computer", "interest", "problem",
  "world", "area", "national", "money", "story", "fact", "month", "water", "young", "never", "service", "state", "game", "face", "end", "begin", "program", "read", "side", "sound",
  "sentence", "study", "process", "add", "land", "spell", "follow", "east", "west", "north", "south", "ground", "show", "find", "lose", "pay", "light", "head", "black", "white",
  "red", "blue", "green", "yellow", "country", "city", "town", "school", "music", "paper", "power", "system", "play", "must", "keep", "start", "every", "help", "line", "user",
  "code", "web", "application", "developer", "design", "speed", "test", "type", "fast", "slow", "react", "clean", "glass", "smooth", "perfect", "future", "digital", "network", "client", "server"
];

export const generateWords = (count) => {
  const result = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * WORDS_LIST.length);
    result.push(WORDS_LIST[randomIndex]);
  }
  return result;
};
