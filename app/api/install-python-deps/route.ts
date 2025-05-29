import { NextResponse } from "next/server"
import { exec } from "child_process"
import { join } from "path"

export async function GET() {
  try {
    const scriptsDir = join(process.cwd(), "scripts")
    const requirementsPath = join(scriptsDir, "requirements.txt")

    // Execute pip install
    const executePip = () => {
      return new Promise<void>((resolve, reject) => {
        exec(`pip install -r "${requirementsPath}"`, (error, stdout, stderr) => {
          if (error) {
            console.error(`Pip installation error: ${error.message}`)
            console.error(`stderr: ${stderr}`)
            reject(error)
            return
          }
          console.log(`Pip installation output: ${stdout}`)
          resolve()
        })
      })
    }

    await executePip()

    return NextResponse.json({
      success: true,
      message: "Python dependencies installed successfully",
    })
  } catch (error) {
    console.error("Error installing Python dependencies:", error)
    return NextResponse.json(
      {
        error: "Failed to install Python dependencies",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
