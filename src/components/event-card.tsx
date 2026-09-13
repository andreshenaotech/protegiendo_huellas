import Image from "next/image";
import { CalendarIcon, ClockIcon, FacebookIcon, InstagramIcon, PinIcon, TikTokIcon } from "@/components/icons";
import { EVENT_FLYERS_BUCKET, getPublicImageUrl } from "@/lib/dog-images";
import { type FoundationEvent, formatEventDate, formatEventTime } from "@/lib/event-content";

type EventCardProps = {
  event: FoundationEvent;
  past?: boolean;
};

// Tarjeta de evento: el flyer conserva su proporción original y solo se
// muestran los datos que el admin llenó, sin espacios vacíos.
export function EventCard({ event, past = false }: EventCardProps) {
  const time = formatEventTime(event.event_time);
  const links = [
    { url: event.instagram_url, label: "Instagram", icon: <InstagramIcon /> },
    { url: event.facebook_url, label: "Facebook", icon: <FacebookIcon /> },
    { url: event.tiktok_url, label: "TikTok", icon: <TikTokIcon /> },
  ].filter((link): link is { url: string; label: string; icon: React.JSX.Element } => Boolean(link.url));

  return (
    <article className={`event-card${past ? " is-past" : ""}`}>
      <div className="event-card-flyer">
        <Image
          src={getPublicImageUrl(EVENT_FLYERS_BUCKET, event.flyer_path)!}
          alt={`Flyer del evento ${event.title}`}
          width={event.flyer_width}
          height={event.flyer_height}
          sizes="(max-width: 620px) calc(100vw - 28px), (max-width: 1050px) 50vw, 380px"
        />
        {past && <span className="event-card-badge">Finalizado</span>}
      </div>

      <div className="event-card-body">
        <p className="event-card-date"><CalendarIcon />{formatEventDate(event.event_date)}</p>
        <h3>{event.title}</h3>

        {(time || event.location) && (
          <ul className="event-card-meta">
            {time && <li><ClockIcon />{time}</li>}
            {event.location && <li><PinIcon />{event.location}</li>}
          </ul>
        )}

        {event.description && <p className="event-card-description">{event.description}</p>}

        {links.length > 0 && (
          <div className="event-card-links" aria-label={`Publicaciones de ${event.title} en redes sociales`}>
            {links.map((link) => (
              <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer">
                {link.icon}
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
