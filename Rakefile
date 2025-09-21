require 'webrick'

desc "Serve the website locally on port 8000"
task :serve do
  puts "Starting local server on http://localhost:8000"
  puts "Press Ctrl+C to stop the server"

  server = WEBrick::HTTPServer.new(
    :Port => 8000,
    :DocumentRoot => Dir.pwd,
    :Logger => WEBrick::Log.new($stderr, WEBrick::Log::WARN),
    :AccessLog => []
  )

  trap('INT') {
    puts "\nShutting down server..."
    server.shutdown
  }

  server.start
end

desc "Open the website in default browser"
task :open do
  system("open http://localhost:8000")
end

desc "Serve and open the website"
task :start => [:serve, :open]

# Set serve as the default task
task :default => :serve

desc "Show available tasks"
task :help do
  puts "Available tasks:"
  puts "  rake serve (default) - Start local server on port 8000"
  puts "  rake open           - Open website in browser"
  puts "  rake start          - Start server and open browser"
  puts "  rake help           - Show this help message"
end