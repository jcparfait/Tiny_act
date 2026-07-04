allowed_origins =
  if Rails.env.development?
    ["*"]
  else
    ENV.fetch("CORS_ORIGINS", "")
       .split(",")
       .map(&:strip)
       .reject(&:blank?)
  end

if allowed_origins.any?
  Rails.application.config.middleware.insert_before 0, Rack::Cors do
    allow do
      origins(*allowed_origins)

      resource "/api/*",
               headers: :any,
               methods: [:get, :post, :patch, :put, :delete, :options]
    end
  end
end
