import { cn } from "../../lib/utils";

export const SimpleTestimonials = ({ data, className }) => {
  return (
    <div className={cn("w-full overflow-hidden py-4", className)}>
      <div className="flex animate-pulse">
        {data.map((testimonial, index) => (
          <div
            key={index}
            className="mx-2 flex h-32 w-80 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-gray-200">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-gray-900">
                    {testimonial.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {testimonial.handle}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-700 overflow-hidden" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {testimonial.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
