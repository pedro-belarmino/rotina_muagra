from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    page.goto("http://localhost:5173/")

    # Use get_by_label to find the input field
    comment_field = page.get_by_label("Comentário do dia")
    expect(comment_field).to_be_visible()
    comment_field.fill("This is a test comment, v2.")

    # Click the save comment button
    page.get_by_role("button", name="Salvar Comentário").click()

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification_v2.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)