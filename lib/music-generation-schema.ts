// Schema for music composition generation
export const musicCompositionSchema = {
  name: "generate_music_composition",
  description: "Generates complete musical compositions in any genre provided by the user.",
  strict: false,
  parameters: {
    type: "object",
    properties: {
      genre: {
        type: "string",
        description:
          "The specific musical genre desired (e.g., Pop, Rock, Electronic, Classical, Jazz, Hip-Hop, Country, Reggae, Blues, etc.).",
      },
      mood: {
        type: "string",
        description:
          "The overall feeling or emotion the music should evoke (e.g., happy, sad, energetic, calm, romantic, aggressive, thoughtful, etc.).",
      },
      theme: {
        type: "string",
        description: "The central topic or concept the music should convey (optional).",
      },
      instrumentation: {
        type: "array",
        description: "List of instruments appropriate for the chosen genre.",
        items: {
          type: "string",
          description: "Name of an instrument used in the composition.",
        },
      },
      structure: {
        type: "string",
        description: "The clear musical structure to be followed (e.g., verse-chorus, ABAB, sonata form, etc.).",
      },
      melody: {
        type: "string",
        description: "A description of the melody created for the composition.",
      },
      harmony: {
        type: "string",
        description: "A description of the harmonies that complement the melody.",
      },
      rhythm: {
        type: "string",
        description: "A description of the rhythm and tempo established for the piece.",
      },
    },
  },
}
