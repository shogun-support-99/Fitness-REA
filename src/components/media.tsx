import { useState } from 'react'
import { Icon } from './icons'
import { gifUrl, imgUrl } from '../data/exercises'

/**
 * Row thumbnail: dataset static frame with a drawn-icon fallback when the
 * exercise has no media or the CDN image fails to load.
 */
export function ExerciseThumb({ media, size = 20 }: { media?: string; size?: number }) {
  const [failed, setFailed] = useState(false)
  if (!media || failed) return <Icon name="dumbbell" size={size} />
  return (
    <img
      loading="lazy"
      src={imgUrl(media)}
      alt=""
      onError={() => setFailed(true)}
    />
  )
}

/**
 * Detail animation: the GIF first, the static frame as a fallback if the GIF
 * cannot load, and nothing (attributeion included) if both fail.
 */
export function ExerciseGif({ media, name }: { media: string; name: string }) {
  const [stage, setStage] = useState<'gif' | 'jpg' | 'gone'>('gif')
  if (stage === 'gone') return null
  return (
    <figure className="ex-media">
      <img
        src={stage === 'gif' ? gifUrl(media) : imgUrl(media)}
        alt={`${name} — exercise animation`}
        loading="lazy"
        onError={() => setStage(stage === 'gif' ? 'jpg' : 'gone')}
      />
      <figcaption>Exercise animation © Gym visual</figcaption>
    </figure>
  )
}
