import db from './database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export function seedDatabase() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) {
    console.log('🌱 Database already populated. Skipping seed.');
    return;
  }

  console.log('🌱 Seeding database with SRS sample profiles, taxonomy, and assessments...');

  // Hash password
  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('Password123!', salt);
  const adminPasswordHash = bcrypt.hashSync('Admin123!', salt);

  // 1. Insert Categories
  const categories = [
    { id: 'cat-web', name: 'Web Development', description: 'Frontend, backend, and full-stack web applications', icon: 'Globe' },
    { id: 'cat-cloud', name: 'Cloud & DevOps', description: 'Cloud infrastructure, containerization, microservices, and CI/CD', icon: 'Cloud' },
    { id: 'cat-ai', name: 'AI & Data Science', description: 'Machine learning, predictive analytics, and Python', icon: 'Cpu' },
    { id: 'cat-mobile', name: 'Mobile App Development', description: 'Cross-platform and native iOS/Android development', icon: 'Smartphone' },
    { id: 'cat-design', name: 'UI/UX Design', description: 'User interface, wireframing, and design systems', icon: 'Palette' },
    { id: 'cat-security', name: 'Cybersecurity & Backend', description: 'Secure architecture, API protection, and databases', icon: 'ShieldCheck' },
  ];

  const insertCategory = db.prepare(`
    INSERT INTO categories (id, name, description, icon) VALUES (?, ?, ?, ?)
  `);

  for (const cat of categories) {
    insertCategory.run(cat.id, cat.name, cat.description, cat.icon);
  }

  // 2. Insert Taxonomy Skills
  const taxonomy = [
    { id: 'tax-react', cat: 'cat-web', name: 'React', desc: 'Component-based UI development with hooks and state management' },
    { id: 'tax-node', cat: 'cat-web', name: 'Node.js', desc: 'Asynchronous event-driven server-side runtime' },
    { id: 'tax-ts', cat: 'cat-web', name: 'TypeScript', desc: 'Strictly typed superset of JavaScript for large applications' },
    { id: 'tax-cloud', cat: 'cat-cloud', name: 'Cloud & DevOps Architecture', desc: 'Designing scalable, resilient distributed systems, containers, and pipelines' },
    { id: 'tax-docker', cat: 'cat-cloud', name: 'Docker & Containers', desc: 'Containerizing applications for seamless deployment' },
    { id: 'tax-python', cat: 'cat-ai', name: 'Python', desc: 'Core Python, scripting, data pipelines, and automation' },
    { id: 'tax-ml', cat: 'cat-ai', name: 'Machine Learning', desc: 'Model training, scikit-learn, supervised and unsupervised learning' },
    { id: 'tax-figma', cat: 'cat-design', name: 'Figma & UI Systems', desc: 'Component libraries, wireframes, and design guidelines' },
    { id: 'tax-ux', cat: 'cat-design', name: 'User Research & UX', desc: 'User testing, heuristic evaluations, and persona modeling' },
    { id: 'tax-flutter', cat: 'cat-mobile', name: 'Flutter', desc: 'Multi-platform mobile app development with Dart' },
  ];

  const insertTaxonomy = db.prepare(`
    INSERT INTO skills_taxonomy (id, category_id, name, description) VALUES (?, ?, ?, ?)
  `);
  for (const tax of taxonomy) {
    insertTaxonomy.run(tax.id, tax.cat, tax.name, tax.desc);
  }

  // 3. Insert Users (Freelancers, Clients, Admin)
  // Matching SRS Wireframe: Riya Kapoor (Full Stack Dev)
  const users = [
    {
      id: 'usr-riya',
      username: 'riya_kapoor',
      email: 'riya.kapoor@example.com',
      password_hash: defaultPasswordHash,
      role: 'freelancer',
      full_name: 'Riya Kapoor',
      title: 'Full Stack Dev',
      bio: 'Full Stack Engineer with 4+ years of experience building modern web apps and cloud architectures. Passionate about performant React interfaces and resilient Node.js microservices.',
      location: 'Bengaluru, India',
      hourly_rate: 55.0,
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98765 43210',
      rating: 4.9,
      reviews_count: 14,
    },
    {
      id: 'usr-alex',
      username: 'alex_rivera',
      email: 'alex.rivera@example.com',
      password_hash: defaultPasswordHash,
      role: 'freelancer',
      full_name: 'Alex Rivera',
      title: 'Cloud & DevOps Solutions Architect',
      bio: 'Senior Cloud Solutions Architect with deep expertise in Docker, Kubernetes, Terraform, and zero-downtime CI/CD pipelines.',
      location: 'Austin, TX, USA',
      hourly_rate: 85.0,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: '+1 512 555 0192',
      rating: 5.0,
      reviews_count: 22,
    },
    {
      id: 'usr-priya',
      username: 'priya_patel',
      email: 'priya.patel@example.com',
      password_hash: defaultPasswordHash,
      role: 'freelancer',
      full_name: 'Priya Patel',
      title: 'Senior Product & UI/UX Designer',
      bio: 'Human-centered design advocate. Specialized in WCAG 2.1 AA accessible web applications, Figma design systems, and rapid interactive prototyping.',
      location: 'London, UK',
      hourly_rate: 65.0,
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      phone: '+44 20 7946 0912',
      rating: 4.8,
      reviews_count: 9,
    },
    {
      id: 'usr-marcus',
      username: 'marcus_chen',
      email: 'marcus.chen@example.com',
      password_hash: defaultPasswordHash,
      role: 'freelancer',
      full_name: 'Marcus Chen',
      title: 'AI & Data Science Specialist',
      bio: 'Machine learning specialist focused on predictive models, computer vision, and building high-throughput Python inference APIs.',
      location: 'Singapore',
      hourly_rate: 75.0,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      phone: '+65 6789 0123',
      rating: 4.7,
      reviews_count: 11,
    },
    // Client Users
    {
      id: 'usr-client1',
      username: 'apex_ventures',
      email: 'recruiting@apexventures.io',
      password_hash: defaultPasswordHash,
      role: 'client',
      full_name: 'Apex Tech Ventures',
      title: 'VP of Engineering',
      bio: 'Tech incubator hiring top-tier verified freelance engineers and architects for high-growth portfolio startups.',
      location: 'San Francisco, CA',
      hourly_rate: 0,
      avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      phone: '+1 415 555 2671',
      rating: 5.0,
      reviews_count: 5,
    },
    {
      id: 'usr-client2',
      username: 'nexacorp',
      email: 'talent@nexacorp.global',
      password_hash: defaultPasswordHash,
      role: 'client',
      full_name: 'NexaCorp Global',
      title: 'Talent Acquisition Director',
      bio: 'Enterprise digital transformation agency seeking vetted specialists in cloud, frontend, and design.',
      location: 'New York, NY',
      hourly_rate: 0,
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      phone: '+1 212 555 8392',
      rating: 4.9,
      reviews_count: 8,
    },
    // Admin User
    {
      id: 'usr-admin',
      username: 'admin',
      email: 'admin@fsms.org',
      password_hash: adminPasswordHash,
      role: 'admin',
      full_name: 'System Administrator',
      title: 'Platform Compliance Lead',
      bio: 'Superuser maintaining quality assurance, skill taxonomy moderation, and platform trust & safety.',
      location: 'HQ Remote',
      hourly_rate: 0,
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      phone: '+1 800 555 0100',
      rating: 5.0,
      reviews_count: 0,
    },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, username, email, password_hash, role, full_name, title, bio, location, hourly_rate, avatar_url, phone, rating, reviews_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const u of users) {
    insertUser.run(u.id, u.username, u.email, u.password_hash, u.role, u.full_name, u.title, u.bio, u.location, u.hourly_rate, u.avatar_url, u.phone, u.rating, u.reviews_count);
  }

  // 4. Insert Freelancer Skills (Matching Wireframe Page 8 for Riya Kapoor)
  const freelancerSkills = [
    // Riya Kapoor
    { id: 'fsk-riya-react', fId: 'usr-riya', name: 'React', cat: 'Web Development', level: 'Advanced', status: 'Endorsed', score: 88, endorsements: 6 },
    { id: 'fsk-riya-node', fId: 'usr-riya', name: 'Node.js', cat: 'Web Development', level: 'Intermediate', status: 'Pending', score: null, endorsements: 0 },
    { id: 'fsk-riya-cloud', fId: 'usr-riya', name: 'Cloud & DevOps Architecture', cat: 'Cloud & DevOps', level: 'Advanced', status: 'Assessed', score: 92, endorsements: 3 },
    { id: 'fsk-riya-ts', fId: 'usr-riya', name: 'TypeScript', cat: 'Web Development', level: 'Advanced', status: 'Endorsed', score: 85, endorsements: 4 },

    // Alex Rivera
    { id: 'fsk-alex-cloud', fId: 'usr-alex', name: 'Cloud & DevOps Architecture', cat: 'Cloud & DevOps', level: 'Expert', status: 'Assessed', score: 98, endorsements: 12 },
    { id: 'fsk-alex-docker', fId: 'usr-alex', name: 'Docker & Containers', cat: 'Cloud & DevOps', level: 'Expert', status: 'Endorsed', score: 94, endorsements: 8 },

    // Priya Patel
    { id: 'fsk-priya-figma', fId: 'usr-priya', name: 'Figma & UI Systems', cat: 'UI/UX Design', level: 'Expert', status: 'Assessed', score: 96, endorsements: 9 },
    { id: 'fsk-priya-ux', fId: 'usr-priya', name: 'User Research & UX', cat: 'UI/UX Design', level: 'Advanced', status: 'Endorsed', score: 90, endorsements: 5 },

    // Marcus Chen
    { id: 'fsk-marcus-py', fId: 'usr-marcus', name: 'Python', cat: 'AI & Data Science', level: 'Expert', status: 'Assessed', score: 94, endorsements: 7 },
    { id: 'fsk-marcus-ml', fId: 'usr-marcus', name: 'Machine Learning', cat: 'AI & Data Science', level: 'Advanced', status: 'Endorsed', score: 86, endorsements: 4 },
  ];

  const insertFsk = db.prepare(`
    INSERT INTO freelancer_skills (id, freelancer_id, skill_name, category_name, proficiency_level, status, assessment_score, endorsement_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const fs of freelancerSkills) {
    insertFsk.run(fs.id, fs.fId, fs.name, fs.cat, fs.level, fs.status, fs.score, fs.endorsements);
  }

  // 5. Insert Evidence / Portfolio items (SRS F3)
  const evidenceList = [
    {
      id: 'ev-1',
      skillId: 'fsk-riya-react',
      fId: 'usr-riya',
      title: 'E-Commerce Microfrontend Architecture Case Study',
      fileUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
      type: 'image/jpeg',
      size: 1024 * 340,
      storageType: 'local',
      status: 'Verified',
      notes: 'Production deployment case study demonstrating sub-second load times and modular React components.',
    },
    {
      id: 'ev-2',
      skillId: 'fsk-riya-cloud',
      fId: 'usr-riya',
      title: 'Professional Cloud Solutions Certificate',
      fileUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=600&auto=format&fit=crop&q=80',
      type: 'image/jpeg',
      size: 1024 * 512,
      storageType: 'local',
      status: 'Verified',
      notes: 'Valid certification verified by platform compliance.',
    },
    {
      id: 'ev-3',
      skillId: 'fsk-riya-node',
      fId: 'usr-riya',
      title: 'High-Concurrency REST API Benchmark Report',
      fileUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
      type: 'image/jpeg',
      size: 1024 * 220,
      storageType: 'local',
      status: 'Uploaded',
      notes: 'Awaiting admin review in moderation queue.',
    },
  ];

  const insertEv = db.prepare(`
    INSERT INTO evidence (id, freelancer_skill_id, freelancer_id, title, file_url, file_type, file_size, storage_type, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const ev of evidenceList) {
    insertEv.run(ev.id, ev.skillId, ev.fId, ev.title, ev.fileUrl, ev.type, ev.size, ev.storageType, ev.status, ev.notes);
  }

  // 6. Insert Endorsements (SRS F4, U2)
  const endorsements = [
    {
      id: 'end-1',
      skillId: 'fsk-riya-react',
      fId: 'usr-riya',
      endorserId: 'usr-client1',
      name: 'Apex Tech Ventures',
      role: 'client',
      comment: 'Riya delivered our React dashboard ahead of schedule with immaculate state management and zero regressions.',
    },
    {
      id: 'end-2',
      skillId: 'fsk-riya-react',
      fId: 'usr-riya',
      endorserId: 'usr-alex',
      name: 'Alex Rivera',
      role: 'freelancer',
      comment: 'Outstanding React architect! Seamless integration with our containerized cloud backend.',
    },
    {
      id: 'end-3',
      skillId: 'fsk-riya-cloud',
      fId: 'usr-riya',
      endorserId: 'usr-alex',
      name: 'Alex Rivera',
      role: 'freelancer',
      comment: 'Strong practical grasp of cloud security, object storage policies, and containerized microservices.',
    },
  ];

  const insertEndorsement = db.prepare(`
    INSERT INTO endorsements (id, freelancer_skill_id, freelancer_id, endorser_id, endorser_name, endorser_role, comment)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const end of endorsements) {
    insertEndorsement.run(end.id, end.skillId, end.fId, end.endorserId, end.name, end.role, end.comment);
  }

  // 7. Insert Assessments (SRS F5, P4)
  const assessments = [
    {
      id: 'asmt-react',
      skill_name: 'React',
      category_name: 'Web Development',
      title: 'React.js Core Competency Assessment',
      description: 'Tests knowledge of modern React hooks, component lifecycle, virtual DOM reconciliation, and state isolation.',
      time_limit_seconds: 180, // 3 minutes for quick testing
      pass_percentage: 70.0,
      questions: [
        {
          id: 'q1',
          question: 'What is the primary benefit of the React Virtual DOM?',
          options: [
            'Directly manipulating browser DOM nodes at native C++ speeds',
            'Minimizing costly real DOM reflows by calculating diffs in memory before batching updates',
            'Eliminating the need for CSS stylesheets in web applications',
            'Enforcing synchronous multi-threaded execution in JavaScript',
          ],
          correctAnswerIndex: 1,
          explanation: 'The Virtual DOM allows React to batch UI updates and compute minimal diffs before touching the real browser DOM.',
        },
        {
          id: 'q2',
          question: 'When does the cleanup function returned by useEffect execute?',
          options: [
            'Only once when the application server reboots',
            'Before the component unmounts and prior to re-running the effect on dependency change',
            'Immediately before the first render completes',
            'Every millisecond during active mouse movement',
          ],
          correctAnswerIndex: 1,
          explanation: 'The cleanup function executes right before the effect re-runs (if dependencies changed) and when the component unmounts.',
        },
        {
          id: 'q3',
          question: 'Which React hook should be preferred to optimize expensive value calculations across renders?',
          options: ['useCallback', 'useMemo', 'useRef', 'useId'],
          correctAnswerIndex: 1,
          explanation: 'useMemo returns a memoized value, recomputing it only when one of the specified dependencies has changed.',
        },
        {
          id: 'q4',
          question: 'Why must state updates in React never mutate existing objects or arrays directly?',
          options: [
            'Direct mutation prevents React shallow comparison from detecting changes, failing to trigger re-renders',
            'JavaScript syntax prohibits assigning properties to objects created inside functions',
            'Direct mutation deletes the object from RAM permanently',
            'Browsers crash when an array is mutated without an explicit lock',
          ],
          correctAnswerIndex: 0,
          explanation: 'React relies on immutable state updates to detect referential differences during shallow equality checks.',
        },
        {
          id: 'q5',
          question: 'What is the purpose of the `key` prop in React lists?',
          options: [
            'It provides encrypted data binding for backend database keys',
            'It helps React identify which items have changed, been added, or removed during list reconciliation',
            'It defines the CSS z-index stacking layer of the element',
            'It is required by the HTTP/2 specification for asset caching',
          ],
          correctAnswerIndex: 1,
          explanation: 'Keys give elements a stable identity so React can reconcile dynamic arrays efficiently without re-rendering every item.',
        },
      ],
    },
    {
      id: 'asmt-cloud',
      skill_name: 'Cloud & DevOps Architecture',
      category_name: 'Cloud & DevOps',
      title: 'Cloud & DevOps Architecture Assessment',
      description: 'Covers essential system architecture, Docker containerization, scaling patterns, microservices, and CI/CD automation.',
      time_limit_seconds: 180,
      pass_percentage: 70.0,
      questions: [
        {
          id: 'q1',
          question: 'What is the primary architectural advantage of containerization with Docker compared to traditional virtual machines?',
          options: [
            'Containers require their own dedicated hypervisor and full guest operating system',
            'Containers share the host OS kernel and isolate user spaces, enabling lightweight, fast startups and low memory overhead',
            'Containers eliminate the need for networking protocols',
            'Containers can only run on physical bare-metal hardware without an operating system',
          ],
          correctAnswerIndex: 1,
          explanation: 'Containers share the host operating system kernel, making them vastly lighter, faster to spin up, and more portable than full VMs.',
        },
        {
          id: 'q2',
          question: 'In a microservices architecture, what pattern decouples services and enables asynchronous message processing?',
          options: [
            'Direct synchronous REST calls between all services',
            'Message Broker / Publish-Subscribe (e.g. RabbitMQ, Kafka)',
            'Sharing a single relational database table across every service',
            'Hardcoding IP addresses in client browsers',
          ],
          correctAnswerIndex: 1,
          explanation: 'A publish-subscribe message broker decouples microservices, allowing asynchronous event processing and high fault tolerance.',
        },
        {
          id: 'q3',
          question: 'What deployment strategy routes traffic between two identical production environments to achieve zero-downtime releases?',
          options: ['Big Bang deployment', 'Blue-Green deployment', 'Manual cold-swap deployment', 'In-place overwrite'],
          correctAnswerIndex: 1,
          explanation: 'Blue-Green deployment runs two identical environments; traffic is switched from the current environment (Blue) to the new release (Green) once validated.',
        },
        {
          id: 'q4',
          question: 'In system security and access control, what does the Principle of Least Privilege mandate?',
          options: [
            'Granting superuser permissions to all developers to avoid access requests',
            'Granting users and processes only the minimum permissions necessary to perform their specific tasks',
            'Allowing unrestricted root access from any network interface without authentication',
            'Storing plain-text private keys in public version control repositories',
          ],
          correctAnswerIndex: 1,
          explanation: 'Least privilege dictates users and compute roles have only the minimum access needed for their specific operations.',
        },
        {
          id: 'q5',
          question: 'What is horizontal autoscaling (scaling out) in cloud infrastructure?',
          options: [
            'Replacing a server with one that has higher CPU and RAM capacity',
            'Dynamically adding or removing application instances in response to incoming traffic load',
            'Manually restarting servers whenever latency exceeds 5 seconds',
            'Compressing images stored on the local file system',
          ],
          correctAnswerIndex: 1,
          explanation: 'Horizontal scaling (scaling out) adds more compute nodes/instances behind a load balancer to distribute variable traffic.',
        },
      ],
    },
    {
      id: 'asmt-python',
      skill_name: 'Python',
      category_name: 'AI & Data Science',
      title: 'Python for Data & Backend Systems',
      description: 'Tests proficiency in Python syntax, data structures, generators, list comprehensions, and memory management.',
      time_limit_seconds: 180,
      pass_percentage: 70.0,
      questions: [
        {
          id: 'q1',
          question: 'What does a generator function in Python use to return intermediate values lazily without exhausting memory?',
          options: ['return', 'yield', 'emit', 'await'],
          correctAnswerIndex: 1,
          explanation: 'The yield statement pauses the function, returning the value while maintaining state for the next call to next().',
        },
        {
          id: 'q2',
          question: 'What is the time complexity of looking up a key in a standard Python dictionary?',
          options: ['O(n^2)', 'O(log n)', 'O(1) average case', 'O(n) always'],
          correctAnswerIndex: 2,
          explanation: 'Python dictionaries are implemented using hash tables, offering O(1) average time complexity for key lookups.',
        },
        {
          id: 'q3',
          question: 'How do you create a clean list containing squares of even numbers from 0 to 9 using list comprehension?',
          options: [
            '[x**2 for x in range(10) if x % 2 == 0]',
            'list(map(lambda x: x*2 if x%2, 10))',
            '{x: x**2 for x in 10}',
            '[if x % 2 == 0: x**2 for x in range(10)]',
          ],
          correctAnswerIndex: 0,
          explanation: '[x**2 for x in range(10) if x % 2 == 0] is standard and clean Python list comprehension syntax.',
        },
        {
          id: 'q4',
          question: 'What does the Global Interpreter Lock (GIL) in CPython do?',
          options: [
            'Encrypts bytecode on disk using AES-256',
            'Prevents multiple native OS threads from executing Python bytecodes simultaneously in a single process',
            'Locks files from being edited while a script is running',
            'Restricts HTTP requests to port 80 only',
          ],
          correctAnswerIndex: 1,
          explanation: 'The GIL ensures that only one thread executes Python bytecode at once in standard CPython to preserve thread-safe reference counting.',
        },
        {
          id: 'q5',
          question: 'What is the difference between `is` and `==` in Python?',
          options: [
            '`is` checks memory identity (same object), whereas `==` checks value equality',
            '`is` converts both sides to booleans, while `==` checks string length',
            'They are completely identical and interchangeable aliases',
            '`==` is only used for numbers, and `is` is only used for strings',
          ],
          correctAnswerIndex: 0,
          explanation: '`is` tests whether two references point to the same object in memory (`id(a) == id(b)`), while `==` checks equivalence of values.',
        },
      ],
    },
    {
      id: 'asmt-node',
      skill_name: 'Node.js',
      category_name: 'Web Development',
      title: 'Node.js Backend Architecture Assessment',
      description: 'Evaluates asynchronous event loop understanding, streams, middleware patterns, and non-blocking I/O.',
      time_limit_seconds: 180,
      pass_percentage: 70.0,
      questions: [
        {
          id: 'q1',
          question: 'What handles heavy asynchronous I/O operations (such as file reads and DNS lookups) behind the Node.js event loop?',
          options: ['V8 Garbage Collector', 'libuv worker thread pool', 'Browser WebAPI', 'Apache Tomcat worker'],
          correctAnswerIndex: 1,
          explanation: 'libuv provides a multi-platform C library with a default 4-thread pool for non-blocking file system and network calls.',
        },
        {
          id: 'q2',
          question: 'Why should CPU-bound heavy calculations (e.g. large cryptographic hashing loops) be offloaded to worker threads in Node.js?',
          options: [
            'Because CPU-intensive tasks block the single-threaded event loop, delaying all other pending requests',
            'Because Node.js crashes if a loop runs longer than 5 iterations',
            'Because memory is cleared after every synchronous loop',
            'Worker threads run on the client browser instead of the server',
          ],
          correctAnswerIndex: 0,
          explanation: 'Blocking the main thread stops the event loop from servicing other incoming HTTP connections.',
        },
        {
          id: 'q3',
          question: 'What parameter must Express middleware call to pass control to the subsequent middleware function in the stack?',
          options: ['proceed()', 'next()', 'continue()', 'forward()'],
          correctAnswerIndex: 1,
          explanation: 'In Express, invoking `next()` passes the request context to the next middleware handler in the pipeline.',
        },
        {
          id: 'q4',
          question: 'Which Node.js core stream method efficiently handles backpressure when reading a large file and streaming it to an HTTP response?',
          options: ['readableStream.pipe(response)', 'readableStream.flush(response)', 'response.absorb(readableStream)', 'fs.readFileSync()'],
          correctAnswerIndex: 0,
          explanation: '`pipe()` automatically manages data flow rates between readable and writable streams, preventing buffer overload.',
        },
        {
          id: 'q5',
          question: 'What does `process.nextTick()` do compared to `setImmediate()`?',
          options: [
            '`process.nextTick()` callbacks are processed immediately before the event loop continues to the next phase',
            '`process.nextTick()` pauses execution for 1000 milliseconds',
            'They are identical and execute in random order',
            '`setImmediate()` executes before any synchronous code',
          ],
          correctAnswerIndex: 0,
          explanation: '`process.nextTick()` queues a microtask that runs right after the current operation finishes before the event loop moves on.',
        },
      ],
    },
    {
      id: 'asmt-design',
      skill_name: 'Figma & UI Systems',
      category_name: 'UI/UX Design',
      title: 'UI/UX Design Systems & Accessibility',
      description: 'Tests knowledge of WCAG 2.1 AA accessibility guidelines, layout grids, heuristic analysis, and design tokens.',
      time_limit_seconds: 180,
      pass_percentage: 70.0,
      questions: [
        {
          id: 'q1',
          question: 'What is the minimum contrast ratio required by WCAG 2.1 AA for regular body text?',
          options: ['2.5:1', '3.0:1', '4.5:1', '7.0:1'],
          correctAnswerIndex: 2,
          explanation: 'WCAG 2.1 AA requires a minimum contrast ratio of 4.5:1 for standard text (3:1 for large text).',
        },
        {
          id: 'q2',
          question: 'What is the core purpose of a Design Token in scalable design systems?',
          options: [
            'A cryptocurrency used to purchase UI templates',
            'A single source of truth for design values (colors, spacing, typography) shared between Figma and code',
            'A watermark embedded in export files to prove copyright',
            'An authentication token required to download SVG icons',
          ],
          correctAnswerIndex: 1,
          explanation: 'Design tokens store design decisions (colors, radii, spacing) in platform-agnostic key-value pairs (JSON).',
        },
        {
          id: 'q3',
          question: 'Which of the following describes Jakob Nielsen’s heuristic "Visibility of System Status"?',
          options: [
            'The system should always keep users informed about what is going on through appropriate feedback within a reasonable time',
            'All text must be colored neon yellow for maximum visibility',
            'The website must display server CPU load to end users',
            'The system should hide error codes until the page is refreshed',
          ],
          correctAnswerIndex: 0,
          explanation: 'Systems should provide clear feedback (progress bars, spinners, success notifications) to keep users informed.',
        },
        {
          id: 'q4',
          question: 'What is the difference between a Wireframe and a High-Fidelity Prototype?',
          options: [
            'Wireframes outline layout and structural hierarchy; high-fidelity prototypes simulate visual polish and realistic interactions',
            'Wireframes are only created by clients, while prototypes are created by QA',
            'Wireframes include full animations and video, while prototypes are pure text',
            'They are identical terms in modern agile methodology',
          ],
          correctAnswerIndex: 0,
          explanation: 'Wireframes are low-fidelity structural blueprints, whereas high-fidelity prototypes incorporate colors, typography, and interactive behaviors.',
        },
        {
          id: 'q5',
          question: 'Why should form inputs always feature explicit `<label>` tags with matching `for`/`id` attributes?',
          options: [
            'To ensure screen readers can announce the purpose of the input and improve tap targets for mobile usability',
            'To prevent browsers from caching form passwords',
            'To automatically translate labels into French',
            'To increase the size of the HTTP POST payload',
          ],
          correctAnswerIndex: 0,
          explanation: 'Explicit labels are essential for screen readers and accessibility, and clicking the label focuses the corresponding input.',
        },
      ],
    },
  ];

  const insertAssessment = db.prepare(`
    INSERT INTO assessments (id, skill_name, category_name, title, description, time_limit_seconds, pass_percentage, questions_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const asmt of assessments) {
    insertAssessment.run(
      asmt.id,
      asmt.skill_name,
      asmt.category_name,
      asmt.title,
      asmt.description,
      asmt.time_limit_seconds,
      asmt.pass_percentage,
      JSON.stringify(asmt.questions)
    );
  }

  // 8. Insert Initial Assessment Results for sample freelancers
  const insertResult = db.prepare(`
    INSERT INTO assessment_results (id, assessment_id, freelancer_id, skill_name, score_percentage, passed, answers_summary_json, time_taken_seconds)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertResult.run(
    'asmt-res-1',
    'asmt-cloud',
    'usr-riya',
    'Cloud & DevOps Architecture',
    92.0,
    1,
    JSON.stringify({ correct: 4, total: 5, status: 'Passed' }),
    115
  );

  insertResult.run(
    'asmt-res-2',
    'asmt-cloud',
    'usr-alex',
    'Cloud & DevOps Architecture',
    98.0,
    1,
    JSON.stringify({ correct: 5, total: 5, status: 'Passed' }),
    94
  );

  // 9. Insert Notifications (SRS F8)
  const notifications = [
    {
      id: 'notif-1',
      userId: 'usr-riya',
      title: 'New Skill Endorsement!',
      message: 'Apex Tech Ventures endorsed your skill "React": "Riya delivered our React dashboard ahead of schedule..."',
      type: 'endorsement',
      read: 0,
    },
    {
      id: 'notif-2',
      userId: 'usr-riya',
      title: 'Assessment Passed 🎉',
      message: 'Congratulations! You scored 92% on "Cloud & DevOps Architecture". Your badge is now active.',
      type: 'assessment',
      read: 1,
    },
    {
      id: 'notif-3',
      userId: 'usr-client1',
      title: 'Smart Match Results Available',
      message: 'We found 3 verified freelancers matching your "Cloud & Full Stack Modernization" project criteria.',
      type: 'match',
      read: 0,
    },
  ];

  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, is_read)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const n of notifications) {
    insertNotif.run(n.id, n.userId, n.title, n.message, n.type, n.read);
  }

  // 10. Insert Admin Audit Logs (SRS S5)
  const auditLogs = [
    {
      id: 'log-1',
      adminId: 'usr-admin',
      adminName: 'System Administrator',
      action: 'TAXONOMY_CREATED',
      targetType: 'CATEGORY',
      targetId: 'cat-web',
      details: 'Created category Web Development and standard skill templates.',
    },
    {
      id: 'log-2',
      adminId: 'usr-admin',
      adminName: 'System Administrator',
      action: 'EVIDENCE_VERIFIED',
      targetType: 'EVIDENCE',
      targetId: 'ev-2',
      details: 'Approved Professional Cloud Solutions credential uploaded by Riya Kapoor.',
    },
  ];

  const insertAudit = db.prepare(`
    INSERT INTO admin_audit_logs (id, admin_id, admin_name, action, target_type, target_id, details)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const a of auditLogs) {
    insertAudit.run(a.id, a.adminId, a.adminName, a.action, a.targetType, a.targetId, a.details);
  }

  console.log('✅ Database seeded successfully with realistic data!');
}
