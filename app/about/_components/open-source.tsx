import type { AboutData, ProjectsData } from '@/lib/data'

interface AboutOpenSourceProps {
  id: string
  title: string
  moreLink: AboutData['openSource']['moreLink']
  data: AboutData['openSource']['data']
}

const categoryNames: Record<keyof ProjectsData, string> = {
  libraries: '类库',
  applications: '应用',
  tools: '工具',
  services: '服务',
  scripts: '脚本',
}

export function AboutOpenSource({ data, moreLink, id, title }: AboutOpenSourceProps) {
  return (
    <section className="space-y-6">
      <h2 className="text-text-primary text-sm font-semibold tracking-wider uppercase" id={id}>
        {title}
      </h2>
      <div className="space-y-8">
        {(Object.keys(data) as Array<keyof ProjectsData>).map((category) => {
          const categoryProjects = data[category] || []

          if (categoryProjects.length === 0) return null

          return (
            <div
              key={category}
              className="border-border-tertiary space-y-4 border-l-2 pl-2 sm:pl-4"
            >
              <h3 className="text-text-primary text-sm font-medium">{categoryNames[category]}</h3>
              <ul className="space-y-4 sm:space-y-3">
                {categoryProjects.map((project) => (
                  <li key={project.name} className="text-text-secondary">
                    <div className="inline-flex flex-col flex-wrap gap-3 sm:flex-row sm:items-center">
                      <div className="inline-flex items-center gap-2">
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-text-primary font-medium"
                        >
                          {project.name}
                        </a>
                        {project.status === 'archived' && (
                          <span className="text-text-tertiary bg-bg-secondary rounded-sm px-1.5 py-0.5 text-xs leading-none">
                            已归档
                          </span>
                        )}
                        {project.stars && (
                          <span className="text-text-tertiary text-xs">★ {project.stars}</span>
                        )}
                        {project.homepage && (
                          <a
                            href={project.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-text-tertiary hover:text-text-secondary text-xs"
                          >
                            主页
                          </a>
                        )}
                      </div>

                      <span className="text-text-tertiary text-sm">{project.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
        <a
          href={moreLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-primary inline-block text-sm"
        >
          探索更多
        </a>
      </div>
    </section>
  )
}
