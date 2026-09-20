export type ProviderStatus = 'configured' | 'not-configured'

export type FreeProvider = {
  id: string
  name: string
  website: string
  envKey: string
  notes: string
}

export const FREE_PROVIDER_POOL: FreeProvider[] = [
  { id: 'groq', name: 'Groq', website: 'https://console.groq.com', envKey: 'GROQ_API_KEY', notes: 'Ücretsiz geliştirici kotası' },
  { id: 'cerebras', name: 'Cerebras', website: 'https://cloud.cerebras.ai', envKey: 'CEREBRAS_API_KEY', notes: 'Ücretsiz deneme kotası' },
  { id: 'together', name: 'Together AI', website: 'https://api.together.ai', envKey: 'TOGETHER_API_KEY', notes: 'Ücretsiz kredi/deneme' },
  { id: 'openrouter', name: 'OpenRouter', website: 'https://openrouter.ai', envKey: 'OPENROUTER_API_KEY', notes: 'Free model rotası mevcut' },
  { id: 'huggingface', name: 'Hugging Face', website: 'https://huggingface.co', envKey: 'HUGGINGFACE_API_KEY', notes: 'Inference ücretsiz modeller' },
  { id: 'deepinfra', name: 'Deep Infra', website: 'https://deepinfra.com', envKey: 'DEEPINFRA_API_KEY', notes: 'Ücretsiz başlangıç kotası' },
  { id: 'mistral', name: 'Mistral', website: 'https://console.mistral.ai', envKey: 'MISTRAL_API_KEY', notes: 'Free API tier' },
  { id: 'cohere', name: 'Cohere', website: 'https://dashboard.cohere.com', envKey: 'COHERE_API_KEY', notes: 'Ücretsiz trial anahtarı' },
  { id: 'sambanova', name: 'SambaNova', website: 'https://cloud.sambanova.ai', envKey: 'SAMBANOVA_API_KEY', notes: 'Ücretsiz geliştirici erişimi' },
  { id: 'cloudflare', name: 'Cloudflare Workers AI', website: 'https://developers.cloudflare.com/workers-ai', envKey: 'CLOUDFLARE_API_TOKEN', notes: 'Workers AI ücretsiz limitleri' },
]

export function getProviderStatuses() {
  return FREE_PROVIDER_POOL.map((provider) => ({
    ...provider,
    status: process.env[provider.envKey] ? 'configured' : 'not-configured' as ProviderStatus,
  }))
}

export function getConfiguredProviderCount() {
  return FREE_PROVIDER_POOL.filter((provider) => Boolean(process.env[provider.envKey])).length
}

export function buildFallbackPlan() {
  return [
    { name: 'Architecture Review', role: 'Architect' },
    { name: 'Implementation', role: 'Developer' },
    { name: 'Quality Gate', role: 'QA' },
    { name: 'Security Shield', role: 'Sentinel' },
  ]
}

export async function generatePlan(prompt: string) {
  const endpoint = process.env.OPENROUTER_API_KEY ? 'https://openrouter.ai/api/v1/chat/completions' : null
  if (!endpoint) return buildFallbackPlan()

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'ONYX-Nexus',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'openrouter/free',
      temperature: 0.1,
      messages: [
        { role: 'system', content: 'Return only a JSON array of branches with name and role. Roles: Architect, Developer, QA, Sentinel, Researcher.' },
        { role: 'user', content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(12000),
  })
  if (!response.ok) throw new Error(`Provider returned ${response.status}`)
  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Provider returned an empty plan')
  return JSON.parse(content.replace(/^```json\s*|\s*```$/g, ''))
}

export function hasFeatureSupport() {
  return {
    threeDRenderStudio: Boolean(process.env.THREERENDERSTUDIO_URL),
    tts: Boolean(process.env.TTS_API_URL || process.env.ELEVENLABS_API_KEY || process.env.OPENAI_API_KEY),
  }
}

export function getSshStatus() {
  const configured = Boolean(process.env.COLAB_SSH_HOST && process.env.COLAB_SSH_USER)
  return {
    configured,
    host: process.env.COLAB_SSH_HOST ? '[configured]' : null,
    user: process.env.COLAB_SSH_USER ? '[configured]' : null,
    port: Number(process.env.COLAB_SSH_PORT || 22),
    transport: 'server-side-ssh',
    note: configured ? 'SSH hedefi yapılandırılmış.' : 'COLAB_SSH_HOST ve COLAB_SSH_USER bekleniyor.',
  }
}
