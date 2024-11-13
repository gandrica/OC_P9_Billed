/**
 * @jest-environment jsdom
 */

import {screen,fireEvent, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH,ROUTES} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', {value: localStorageMock})
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root  = document.createElement('div');
      root.setAttribute('id', 'root')
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail');
      expect(mailIcon.className).toEqual('active-icon')
    })
    describe("Then when the handleChangeFile() function is triggered",()=>{
      test("Then when i load a file who doesn't have a .png, .jpeg ou .jpg extension",()=>{
  
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({pathname})
        }
        
        const newBillFn = new NewBill({document, onNavigate, store:mockStore, localStorage: window.localStorage}) 
        const handleChangeFile = jest.fn((e)=>newBillFn.handleChangeFile(e))

        let fileInput = screen.getByTestId('file');
        fileInput.addEventListener('change',(e)=>handleChangeFile(e))
  
        // Create a new FileList object
        const file = new File(['file content'], 'example.txt', { type: 'text/plain' });
        fireEvent.change(fileInput, {target: {files:[file]}})
  
        expect(fileInput.value).toBe("");
        expect(handleChangeFile).toBeCalled()
      })
      test("Then when i load a file who has a .png, .jpeg ou .jpg extension",async ()=>{
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({pathname})
        }
   
        const newBillFn = new NewBill({document, onNavigate, store:mockStore, localStorage: window.localStorage}) 
        const handleChangeFile = jest.fn((e)=>newBillFn.handleChangeFile(e))
  
        const fileInput = screen.getByTestId('file');
        fileInput.addEventListener('change',(e)=>handleChangeFile(e))
  
        // Create a new FileList object
        const file = new File(['file content'], 'test.jpg', { type: 'image/jpeg' });
        fireEvent.change(fileInput, {target: {files:[file]}})

        const createdFile = await newBillFn.store.bills().create(file);
  
        expect(handleChangeFile).toBeCalled()
        expect(createdFile).toEqual({fileUrl: 'https://localhost:3456/images/test.jpg', key: '1234'});
      })
    })
    test("Then when i submit the form the handleSubmit() function is triggered",()=>{
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      }

      const newBillFn = new NewBill({document, onNavigate, store:mockStore, localStorage: window.localStorage}) 
      const handleSubmit = jest.fn((e)=>newBillFn.handleSubmit(e))

      const form = screen.getByTestId('form-new-bill');
      form.addEventListener('submit',(e)=>handleSubmit(e))

      // Find the submit button and click it
      const button = screen.getByText('Envoyer');
      fireEvent.click(button);

      // Check if the handleSubmit function was called with the correct argument
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    }
    )
  })
})

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to NewBill", () => {
    test("Then if the page is displayed correctly", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      const newBillFn = new NewBill({document, onNavigate, store:mockStore, localStorage: window.localStorage}) 
      const handleChangeFile = jest.fn((e)=>newBillFn.handleChangeFile(e))
      const handleSubmit = jest.fn((e)=>newBillFn.handleSubmit(e))

      const pageTitle  = await screen.getByText("Envoyer une note de frais")
      expect(pageTitle).toBeTruthy()

      const form = screen.getByTestId('form-new-bill');
      expect(form).toBeTruthy()
      form.addEventListener('submit',(e)=>handleSubmit(e))

      // Find inputs and type into
      const typeInput = screen.getByTestId("expense-type")
      fireEvent.change(typeInput, { target: { value: 'Hôtel et logement' } })
      const nameInput = screen.getByTestId("expense-name")
      fireEvent.change(nameInput, { target: { value: 'encore' } })
      const amountInput = screen.getByTestId("amount")
      fireEvent.change(amountInput, { target: { value: 400 } })
      const dateInput = screen.getByTestId("datepicker")
      fireEvent.change(dateInput, { target: { value: "2004-04-04" } })
      const vatInput = screen.getByTestId("vat")
      fireEvent.change(vatInput, { target: { value: "80" } })
      const pctInput = screen.getByTestId("pct")
      fireEvent.change(pctInput, { target: { value: 20 } })
      const commentaryInput = screen.getByTestId("commentary")
      fireEvent.change(commentaryInput, { target: { value: "séminaire billed" } })

      const fileInput = screen.getByTestId('file');
      fileInput.addEventListener('change',(e)=>handleChangeFile(e))
      const file = new File(['file content'], 'test.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, {target: {files:[file]}})
      expect(handleChangeFile).toBeCalled()

      const button = screen.getByText('Envoyer');

      expect(typeInput.value).toBeTruthy()
      expect(nameInput.value).toBeTruthy()
      expect(amountInput.value).toBeTruthy()
      expect(dateInput.value).toBeTruthy()
      expect(vatInput.value).toBeTruthy()
      expect(pctInput.value).toBeTruthy()
      expect(commentaryInput.value).toBeTruthy()
      expect(fileInput.files[0]).toBeTruthy()
      expect(button).toBeTruthy()

      fireEvent.click(button);
      expect(handleSubmit).toBeCalled()
    })
  })
})