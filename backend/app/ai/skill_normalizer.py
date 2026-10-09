"""
Skill Normalizer — Dictionary-based skill name normalization.

Maps common aliases, abbreviations, and variations to a canonical form
so that matching and analytics work consistently.
"""

SKILL_ALIASES: dict[str, str] = {
    # Python
    "python3": "Python", "py": "Python", "python 3": "Python", "python2": "Python",
    "python": "Python",
    # JavaScript
    "js": "JavaScript", "java script": "JavaScript", "javascript": "JavaScript",
    "ecmascript": "JavaScript", "es6": "JavaScript",
    # TypeScript
    "ts": "TypeScript", "typescript": "TypeScript",
    # React
    "reactjs": "React", "react.js": "React", "react js": "React", "react": "React",
    # Node.js
    "nodejs": "Node.js", "node": "Node.js", "node.js": "Node.js", "node js": "Node.js",
    # Angular
    "angular": "Angular", "angularjs": "Angular", "angular.js": "Angular",
    # Vue
    "vuejs": "Vue.js", "vue": "Vue.js", "vue.js": "Vue.js",
    # AWS
    "aws cloud": "AWS", "amazon web services": "AWS", "aws": "AWS",
    # Docker
    "docker": "Docker", "docker containers": "Docker",
    # Kubernetes
    "k8s": "Kubernetes", "kubernetes": "Kubernetes", "kube": "Kubernetes",
    # SQL
    "sql": "SQL", "structured query language": "SQL",
    # PostgreSQL
    "postgres": "PostgreSQL", "postgresql": "PostgreSQL", "pg": "PostgreSQL",
    # MySQL
    "mysql": "MySQL", "my sql": "MySQL",
    # MongoDB
    "mongo": "MongoDB", "mongodb": "MongoDB", "mongo db": "MongoDB",
    # Machine Learning
    "ml": "Machine Learning", "machine learning": "Machine Learning",
    # Deep Learning
    "dl": "Deep Learning", "deep learning": "Deep Learning",
    # Artificial Intelligence
    "ai": "Artificial Intelligence", "artificial intelligence": "Artificial Intelligence",
    # NLP
    "nlp": "Natural Language Processing", "natural language processing": "Natural Language Processing",
    # TensorFlow
    "tensorflow": "TensorFlow", "tf": "TensorFlow", "tensor flow": "TensorFlow",
    # PyTorch
    "pytorch": "PyTorch", "torch": "PyTorch",
    # C++
    "cpp": "C++", "c plus plus": "C++", "c++": "C++", "cplusplus": "C++",
    # C#
    "c#": "C#", "csharp": "C#", "c sharp": "C#",
    # C
    "c": "C", "c language": "C",
    # Java
    "java": "Java",
    # Kotlin
    "kotlin": "Kotlin",
    # Swift
    "swift": "Swift",
    # Go
    "golang": "Go", "go": "Go",
    # Rust
    "rust": "Rust",
    # Ruby
    "ruby": "Ruby", "ruby on rails": "Ruby on Rails", "rails": "Ruby on Rails",
    # PHP
    "php": "PHP",
    # HTML/CSS
    "html": "HTML", "html5": "HTML", "css": "CSS", "css3": "CSS",
    "html/css": "HTML/CSS", "html css": "HTML/CSS",
    # Git
    "git": "Git", "github": "GitHub", "gitlab": "GitLab",
    # Django
    "django": "Django",
    # Flask
    "flask": "Flask",
    # Spring
    "spring": "Spring", "spring boot": "Spring Boot", "springboot": "Spring Boot",
    # Express
    "express": "Express.js", "expressjs": "Express.js", "express.js": "Express.js",
    # REST API
    "rest api": "REST API", "rest": "REST API", "restful": "REST API",
    # GraphQL
    "graphql": "GraphQL", "gql": "GraphQL",
    # Linux
    "linux": "Linux", "unix": "Linux",
    # CI/CD
    "ci/cd": "CI/CD", "cicd": "CI/CD", "ci cd": "CI/CD",
    # Terraform
    "terraform": "Terraform",
    # Data Structures
    "dsa": "Data Structures & Algorithms", "data structures": "Data Structures & Algorithms",
    "data structures and algorithms": "Data Structures & Algorithms",
    # System Design
    "system design": "System Design", "sys design": "System Design",
    # Pandas
    "pandas": "Pandas",
    # NumPy
    "numpy": "NumPy",
    # Tableau
    "tableau": "Tableau",
    # Excel
    "excel": "Excel", "ms excel": "Excel", "microsoft excel": "Excel",
    # Power BI
    "power bi": "Power BI", "powerbi": "Power BI",
    # Firebase
    "firebase": "Firebase",
    # Android
    "android": "Android", "android development": "Android",
    # iOS
    "ios": "iOS", "ios development": "iOS",
    # MATLAB
    "matlab": "MATLAB",
    # Embedded Systems
    "embedded systems": "Embedded Systems", "embedded": "Embedded Systems",
    # Signal Processing
    "signal processing": "Signal Processing", "dsp": "Signal Processing",
    # Kafka
    "kafka": "Apache Kafka", "apache kafka": "Apache Kafka",
    # Microservices
    "microservices": "Microservices", "micro services": "Microservices",
    # Statistics
    "statistics": "Statistics", "stats": "Statistics",
    # Agile
    "agile": "Agile", "scrum": "Scrum",
}


def normalize_skill(raw: str) -> str:
    """Normalize a raw skill string to its canonical form.

    Performs case-insensitive lookup in the alias dictionary.
    Falls back to title-casing the trimmed input if no alias found.
    """
    key = raw.strip().lower()
    if key in SKILL_ALIASES:
        return SKILL_ALIASES[key]
    # Fallback: title case
    return raw.strip().title()


def normalize_skills(raw_skills: list[str]) -> list[str]:
    """Normalize a list of skill strings, removing duplicates."""
    seen = set()
    result = []
    for s in raw_skills:
        normalized = normalize_skill(s)
        if normalized.lower() not in seen:
            seen.add(normalized.lower())
            result.append(normalized)
    return result
